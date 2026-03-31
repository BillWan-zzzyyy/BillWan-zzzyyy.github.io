---
layout: page
permalink: /publications/
title: Publications
description: <i>To boldly go where no man has gone before.</i>
nav: true
nav_order: 2
---

<!-- _pages/publications.md -->

<div style="margin-bottom: 1.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
  {% if site.data.scholar_citations %}
  <a href="https://scholar.google.com/citations?user={{ site.scholar_userid }}" target="_blank">
    <img src="https://img.shields.io/badge/Google%20Scholar-{{ site.data.scholar_citations.total_citations }}-4285F4?style=for-the-badge&logo=googlescholar&labelColor=beige" alt="Total Google Scholar citations">
  </a>
  {% endif %}
  {% if site.data.github_stars %}
  <a href="https://github.com/{{ site.github_username }}" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-{{ site.data.github_stars.total_stars }}%20★-181717?style=for-the-badge&logo=github&labelColor=beige" alt="Total GitHub stars">
  </a>
  {% endif %}
</div>

<!-- Bibsearch Feature -->

{% include bib_search.liquid %}

<div class="publications">

{% bibliography %}

</div>
