from __future__ import annotations

import json
from typing import Any

import click


def emit(data: dict[str, Any], use_json: bool) -> None:
    if use_json:
        click.echo(json.dumps(data, ensure_ascii=False))
        return

    if data.get("ok") is False:
        click.echo(f"Error: {data.get('error', 'Unknown error')}", err=True)
        details = data.get("details")
        if details:
            click.echo(str(details), err=True)
        return

    message = data.get("message")
    if message:
        click.echo(message)
        return

    click.echo(json.dumps(data, ensure_ascii=False, indent=2))
