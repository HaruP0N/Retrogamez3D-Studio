<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep category IDs, parsing, product filtering and material options in a shared browser-safe catalog module so all public pages and admin forms use the same rules.
- Category covers are products flagged with is_category; exclude them from item listings and use stable category links with a validated categoria search parameter.
- Export source separately from live data and storage files; include only publishable connection values in a Git-ignored local environment file.
