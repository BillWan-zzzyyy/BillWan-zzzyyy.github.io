---
layout: page
permalink: /publications/
title: Publications
description: <i>To boldly go where no man has gone before.</i>
nav: true
nav_order: 2
---

<!-- _pages/publications.md -->

<div style="margin-bottom: 1.5rem; display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
  {% if site.data.scholar_citations %}
  <a href="https://scholar.google.com/citations?user={{ site.scholar_userid }}" target="_blank" style="display: inline-flex; align-items: stretch; text-decoration: none; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.15);">
    <span style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.7rem; background: #f5f0e6; color: #4285F4; font-size: 1rem; font-weight: 600;">
      <i class="ai ai-google-scholar" style="font-size: 1.3rem;"></i> Google Scholar
    </span>
    <span style="display: inline-flex; align-items: center; padding: 0.45rem 0.75rem; background: #4285F4; color: #fff; font-size: 1.1rem; font-weight: 700;">
      {{ site.data.scholar_citations.total_citations }}
    </span>
  </a>
  {% endif %}
  {% if site.data.github_stars %}
  <a href="https://github.com/{{ site.github_username }}" target="_blank" style="display: inline-flex; align-items: stretch; text-decoration: none; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.15);">
    <span style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.7rem; background: #f5f0e6; color: #181717; font-size: 1rem; font-weight: 600;">
      <i class="fa-brands fa-github" style="font-size: 1.3rem; color: #181717;"></i> GitHub
    </span>
    <span style="display: inline-flex; align-items: center; padding: 0.45rem 0.75rem; background: #181717; color: #fff; font-size: 1.1rem; font-weight: 700;">
      {{ site.data.github_stars.total_stars }} ★
    </span>
  </a>
  {% endif %}
</div>

<!-- Bibsearch Feature -->

{% include bib_search.liquid %}

<div class="publications">

{% bibliography %}

</div>
