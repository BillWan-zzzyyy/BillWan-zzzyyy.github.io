---
layout: page
permalink: /publications/
title: Publications
description: <i>To boldly go where no man has gone before.</i>
nav: true
nav_order: 2
---

<!-- _pages/publications.md -->

{% if site.data.scholar_citations %}
<div style="margin-bottom: 1.5rem;">
  <a href="https://scholar.google.com/citations?user={{ site.scholar_userid }}" target="_blank">
    <img src="https://img.shields.io/badge/Google%20Scholar-{{ site.data.scholar_citations.total_citations }}%20citations-4285F4?logo=googlescholar&labelColor=beige" alt="Total Google Scholar citations">
  </a>
</div>
{% endif %}

<!-- Bibsearch Feature -->

{% include bib_search.liquid %}

<div class="publications">

{% bibliography %}

</div>
