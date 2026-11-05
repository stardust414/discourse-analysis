## Git commit attribution

For commits substantially created or modified with Codex assistance, keep the human user as the primary author and end the commit message with exactly one trailer:

Co-authored-by: Codex <noreply@openai.com>

Rules:

- Add the trailer only when Codex materially contributed to the commit.
- Do not add duplicate Codex attribution trailers.
- Do not rewrite already-published commits solely to add attribution.
- Do not rewrite inherited upstream history or existing third-party co-author trailers.
- Keep the repository user's normal GitHub noreply identity as the human author/committer.
- Release metadata or binary-asset updates alone do not require rewriting source history.
