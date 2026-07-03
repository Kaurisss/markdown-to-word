from __future__ import annotations

import json
import shlex
from pathlib import Path
from typing import Any

import click

from cli_anything.markdown_to_word import __version__
from cli_anything.markdown_to_word.core.preview import inspect_docx, inspect_markdown
from cli_anything.markdown_to_word.core.project import create_project, markdown_stats, set_config_value
from cli_anything.markdown_to_word.core.session import Session
from cli_anything.markdown_to_word.utils.markdown_to_word_backend import export_docx
from cli_anything.markdown_to_word.utils.output import emit
from cli_anything.markdown_to_word.utils.repl_skin import ReplSkin


_repl_mode = False


def _ctx_session(ctx: click.Context) -> Session:
    return ctx.obj["session"]


def _ctx_json(ctx: click.Context) -> bool:
    return bool(ctx.obj["use_json"])


def _parse_value(raw: str) -> Any:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw


@click.group(invoke_without_command=True)
@click.option("--json", "use_json", is_flag=True, help="Output as JSON")
@click.option("--project", "project_path", type=click.Path(path_type=Path), default=None, help="Path to project JSON")
@click.option("--dry-run", "dry_run", is_flag=True, default=False, help="Run without saving one-shot mutations")
@click.pass_context
def cli(ctx: click.Context, use_json: bool, project_path: Path | None, dry_run: bool) -> None:
    ctx.ensure_object(dict)
    session = ctx.obj.get("session") if ctx.obj else None
    if not isinstance(session, Session):
        session = Session(project_path)
        if project_path and project_path.exists():
            session.load()
    elif project_path and session.project_path != project_path:
        session.project_path = project_path
        if project_path.exists():
            session.load()

    ctx.obj.update({"session": session, "use_json": use_json, "dry_run": dry_run})
    if ctx.invoked_subcommand is None:
        ctx.invoke(repl)


@cli.result_callback()
@click.pass_context
def auto_save_on_exit(ctx: click.Context, result: object, **kwargs: Any) -> None:
    if _repl_mode or ctx.obj.get("dry_run"):
        return
    session: Session = ctx.obj["session"]
    if session.has_project() and session._modified and session.project_path:
        session.save_session()


@cli.group()
def project() -> None:
    """Manage project sessions."""


@project.command("new")
@click.option("--name", default="Untitled", show_default=True)
@click.pass_context
def project_new(ctx: click.Context, name: str) -> None:
    session = _ctx_session(ctx)
    session.new_project(name)
    emit({"ok": True, "message": f"Project created: {name}", "project": session.project}, _ctx_json(ctx))


@project.command("status")
@click.pass_context
def project_status(ctx: click.Context) -> None:
    session = _ctx_session(ctx)
    project_data = session.require_project()
    emit({
        "ok": True,
        "name": project_data["name"],
        "modified": session._modified,
        "stats": markdown_stats(project_data["content"]),
        "history": session.history_summary(),
        "last_export": project_data.get("last_export"),
    }, _ctx_json(ctx))


@project.command("save")
@click.argument("path", required=False, type=click.Path(path_type=Path))
@click.pass_context
def project_save(ctx: click.Context, path: Path | None) -> None:
    session = _ctx_session(ctx)
    session.save_session(path)
    emit({"ok": True, "message": f"Project saved: {session.project_path}"}, _ctx_json(ctx))


@project.command("history")
@click.pass_context
def project_history(ctx: click.Context) -> None:
    emit({"ok": True, "history": _ctx_session(ctx).history_summary()}, _ctx_json(ctx))


@project.command("undo")
@click.pass_context
def project_undo(ctx: click.Context) -> None:
    _ctx_session(ctx).undo()
    emit({"ok": True, "message": "Undo complete"}, _ctx_json(ctx))


@project.command("redo")
@click.pass_context
def project_redo(ctx: click.Context) -> None:
    _ctx_session(ctx).redo()
    emit({"ok": True, "message": "Redo complete"}, _ctx_json(ctx))


@cli.group()
def content() -> None:
    """Manage Markdown content."""


@content.command("load")
@click.argument("path", type=click.Path(exists=True, path_type=Path))
@click.pass_context
def content_load(ctx: click.Context, path: Path) -> None:
    session = _ctx_session(ctx)
    session.load_content(path)
    emit({"ok": True, "message": f"Content loaded: {path}", "stats": markdown_stats(session.require_project()["content"])}, _ctx_json(ctx))


@content.command("set")
@click.argument("text")
@click.pass_context
def content_set(ctx: click.Context, text: str) -> None:
    session = _ctx_session(ctx)
    session.set_content(text)
    emit({"ok": True, "message": "Content updated", "stats": markdown_stats(text)}, _ctx_json(ctx))


@content.command("show")
@click.pass_context
def content_show(ctx: click.Context) -> None:
    data = _ctx_session(ctx).require_project()["content"]
    emit({"ok": True, "content": data}, _ctx_json(ctx))


@content.command("stats")
@click.pass_context
def content_stats(ctx: click.Context) -> None:
    data = _ctx_session(ctx).require_project()["content"]
    emit({"ok": True, "stats": markdown_stats(data)}, _ctx_json(ctx))


@cli.group("config")
def config_group() -> None:
    """Manage style configuration."""


@config_group.command("default")
@click.pass_context
def config_default(ctx: click.Context) -> None:
    session = _ctx_session(ctx)
    session.snapshot()
    session.require_project()["config"] = create_project("default")["config"]
    session.mark_modified()
    emit({"ok": True, "message": "Default config applied"}, _ctx_json(ctx))


@config_group.command("load")
@click.argument("path", type=click.Path(exists=True, path_type=Path))
@click.pass_context
def config_load(ctx: click.Context, path: Path) -> None:
    _ctx_session(ctx).load_config(path)
    emit({"ok": True, "message": f"Config loaded: {path}"}, _ctx_json(ctx))


@config_group.command("show")
@click.pass_context
def config_show(ctx: click.Context) -> None:
    emit({"ok": True, "config": _ctx_session(ctx).require_project()["config"]}, _ctx_json(ctx))


@config_group.command("set")
@click.argument("path")
@click.argument("value")
@click.pass_context
def config_set(ctx: click.Context, path: str, value: str) -> None:
    session = _ctx_session(ctx)
    session.snapshot()
    set_config_value(session.require_project(), path, _parse_value(value))
    session.mark_modified()
    emit({"ok": True, "message": f"Config updated: {path}"}, _ctx_json(ctx))


@config_group.command("validate")
@click.pass_context
def config_validate(ctx: click.Context) -> None:
    from backend.config import validate_config

    validate_config(_ctx_session(ctx).require_project()["config"])
    emit({"ok": True, "message": "Config is valid"}, _ctx_json(ctx))


@config_group.command("save")
@click.argument("path", type=click.Path(path_type=Path))
@click.pass_context
def config_save(ctx: click.Context, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(_ctx_session(ctx).require_project()["config"], ensure_ascii=False, indent=2), encoding="utf-8")
    emit({"ok": True, "message": f"Config saved: {path}"}, _ctx_json(ctx))


@cli.group("export")
def export_group() -> None:
    """Export project output."""


@export_group.command("docx")
@click.argument("output", type=click.Path(path_type=Path))
@click.pass_context
def export_docx_command(ctx: click.Context, output: Path) -> None:
    session = _ctx_session(ctx)
    project_data = session.require_project()
    result = export_docx(project_data["content"], project_data["config"], output)
    if result.get("ok"):
        session.record_export(result["output"], result["file_size"], result["created_at"])
    emit(result, _ctx_json(ctx))


@cli.group()
def preview() -> None:
    """Inspect Markdown or DOCX state."""


@preview.command("inspect")
@click.argument("path", required=False, type=click.Path(path_type=Path))
@click.pass_context
def preview_inspect(ctx: click.Context, path: Path | None) -> None:
    if path is None:
        result = inspect_markdown(_ctx_session(ctx).require_project()["content"])
    elif path.suffix.lower() == ".docx":
        result = inspect_docx(path)
    else:
        result = inspect_markdown(path.read_text(encoding="utf-8"))
    result["ok"] = True
    emit(result, _ctx_json(ctx))


@cli.command()
@click.pass_context
def repl(ctx: click.Context) -> None:
    global _repl_mode
    _repl_mode = True
    skin = ReplSkin("markdown-to-word", version=__version__)
    skin.print_banner()
    skin.info("Type commands such as 'project status', 'content stats', or 'exit'.")
    prompt_session = skin.create_prompt_session()

    while True:
        try:
            current = _ctx_session(ctx)
            project_name = current.project.get("name", "") if current.has_project() else ""
            line = skin.get_input(prompt_session, project_name=project_name, modified=current._modified).strip()
        except EOFError:
            break
        if line in {"exit", "quit"}:
            break
        if not line:
            continue
        try:
            args = shlex.split(line)
            cli.main(args=args, obj=ctx.obj, standalone_mode=False)
        except Exception as exc:
            skin.error(str(exc))
    skin.print_goodbye()


def main() -> None:
    cli()


if __name__ == "__main__":
    main()
