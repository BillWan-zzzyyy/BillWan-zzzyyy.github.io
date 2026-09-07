---
layout: page
permalink: /publications/
title: Publications
description: <i>To boldly go where no man has gone before.</i>
nav: true
nav_order: 2
---

<div class="publications">
  <div class="stat-pill-row">
    {% if site.data.scholar_citations %}
      <a class="stat-pill" href="https://scholar.google.com/citations?user={{ site.scholar_userid }}" target="_blank" rel="noopener">
        <span class="stat-pill__label"><i class="ai ai-google-scholar"></i> Google Scholar</span>
        <span class="stat-pill__value">{{ site.data.scholar_citations.total_citations }}</span>
      </a>
    {% endif %}
    {% if site.data.github_stars %}
      <a class="stat-pill" href="https://github.com/{{ site.github_username }}" target="_blank" rel="noopener">
        <span class="stat-pill__label"><i class="fa-brands fa-github"></i> GitHub</span>
        <span class="stat-pill__value">{{ site.data.github_stars.total_stars }} ★</span>
      </a>
    {% endif %}
  </div>

  <!-- Research interests -->
  <section class="research-interests">
    <h2 class="research-interests__title">Research</h2>
    <div class="row align-items-center">
      <div class="col-md-5 mb-3 mb-md-0">
        {% include figure.liquid path="assets/img/drivingsimulator.jpg" class="img-fluid rounded z-depth-1" alt="Driving simulator used for closed-loop autonomous driving experiments" %}
      </div>
      <div class="col-md-7">
        <p class="research-interests__group"><strong>Autonomous driving</strong></p>
        <ul>
          <li>Closed-loop simulation and sim-to-real transfer</li>
          <li>Vision-Language-Action (VLA) models for driving</li>
        </ul>
        <p class="research-interests__group"><strong>Human-centric intelligent transportation</strong></p>
        <ul>
          <li>Human-AI collaborative driving and interaction</li>
          <li>Socially-aware multi-agent systems</li>
        </ul>
      </div>
    </div>
  </section>

  {% include bib_search.liquid %}

  {% bibliography %}
</div>
