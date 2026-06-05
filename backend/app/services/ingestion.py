"""Turn raw course materials into clean text chunks for the generator.

Pipeline: Canvas file/page -> bytes/html -> extracted text -> chunks tagged
with a source reference (so generated questions can cite where they came from).
"""
from __future__ import annotations
from dataclasses import dataclass


@dataclass
class TextChunk:
    text: str
    source_ref: str   # e.g. "AI/03 Decision Trees.pdf#p4"
    topic_hint: str = ""


def extract_pdf(data: bytes, source_ref: str) -> list[TextChunk]:
    """Extract text per page with pypdf. TODO: implement."""
    # from pypdf import PdfReader; reader = PdfReader(BytesIO(data)) ...
    raise NotImplementedError


def extract_pptx(data: bytes, source_ref: str) -> list[TextChunk]:
    """Extract slide text with python-pptx. TODO: implement."""
    # from pptx import Presentation; prs = Presentation(BytesIO(data)) ...
    raise NotImplementedError


def extract_page_html(html: str, source_ref: str) -> list[TextChunk]:
    """Strip a Canvas page's HTML to readable text with BeautifulSoup. TODO."""
    raise NotImplementedError


def chunk(chunks: list[TextChunk], max_chars: int = 4000) -> list[TextChunk]:
    """Merge/split chunks to a size that fits the LLM context window. TODO."""
    raise NotImplementedError
