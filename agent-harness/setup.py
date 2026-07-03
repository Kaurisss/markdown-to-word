from setuptools import find_namespace_packages, setup

setup(
    name="cli-anything-markdown-to-word",
    version="1.0.0",
    description="CLI-Anything harness for the markdown-to-word conversion engine",
    packages=find_namespace_packages(include=["cli_anything.*"]),
    include_package_data=True,
    package_data={
        "cli_anything.markdown_to_word": ["skills/*.md"],
    },
    install_requires=[
        "click>=8.0.0",
        "prompt-toolkit>=3.0.0",
        "python-docx>=1.1.0,<2",
        "markdown-it-py>=4.0,<5",
    ],
    entry_points={
        "console_scripts": [
            "cli-anything-markdown-to-word=cli_anything.markdown_to_word.markdown_to_word_cli:main",
        ],
    },
    python_requires=">=3.10",
)
