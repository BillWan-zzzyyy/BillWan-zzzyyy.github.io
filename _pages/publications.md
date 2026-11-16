---
layout: page
permalink: /publications/
title: Publications
nav: true
nav_order: 2
---

<div class="publications">
  {% assign total_citations = site.data.scholar_citations.total_citations %}
  {% capture paper_count %}{% bibliography_count %}{% endcapture %}
  {% assign paper_count = paper_count | strip %}
  {% assign has_paper_count = false %}
  {% if paper_count != '' and paper_count != '0' %}
    {% assign has_paper_count = true %}
  {% endif %}
  {% if has_paper_count or total_citations != null %}
    <p class="pub-page-meta">
      {% if has_paper_count %}
        {{ paper_count }} {% if paper_count == '1' %}paper{% else %}papers{% endif %}
      {% endif %}
      {% if has_paper_count and total_citations != null %}<span aria-hidden="true">·</span>{% endif %}
      {% if total_citations != null %}
        <a href="https://scholar.google.com/citations?user={{ site.scholar_userid }}">{{ total_citations }} {% if total_citations == 1 %}citation{% else %}citations{% endif %} on Google Scholar</a>
      {% endif %}
    </p>
  {% endif %}

{% bibliography %}

</div>
