---
layout: page
permalink: /about-me/
title: About me
gradient_title: true
description: <i>A few things beyond the papers.</i>
nav: true
nav_order: 5

education:
  - degree: Ph.D. in Civil and Environmental Engineering
    college: Department of Civil and Environmental Engineering
    college_url: https://engineering.wisc.edu/departments/civil-environmental-engineering/
    institution: University of Wisconsin–Madison
    period: Sept 2025 – Present
    advisor: Dr. Sikai (Sky) Chen
    advisor_url: https://sky-lab-uw.github.io/people/
    logo: uwmadison.png
  - degree: M.S. in Transportation Engineering
    college: College of Transportation
    college_url: https://tjjt.tongji.edu.cn/
    institution: Tongji University
    period: Sept 2022 – Jun 2025
    advisor: Prof. Hechao Zhou
    advisor_url: https://tjjt.tongji.edu.cn/info/2943/10933.htm
    logo: tongji.png
  - degree: B.E. in Vehicle Engineering
    college: Institute of Rail Transit
    college_url: https://railway.tongji.edu.cn/main.htm
    institution: Tongji University
    period: Sept 2018 – Jun 2022
    advisor: Prof. Jimin Zhang
    advisor_url: https://railway.tongji.edu.cn/c5/e6/c4609a50662/page.htm
    logo: tongji.png

service:
  - role: Journal Reviewer
    venues:
      - IEEE Transactions on Intelligent Transportation Systems (T-ITS)
  - role: Conference Reviewer
    venues:
      - Transportation Research Board (TRB) Annual Meeting

awards:
  - year: Dec 2025
    title: "Outstanding Master's Thesis (Top 5%)"
    institution: Tongji University
    detail: "Study of the curve passing performance of the Virtual Track Train based on driving simulation platform"
  - year: Oct 2024
    title: CRRC Zhuzhou Fellowship
    institution: Tongji University
  - year: Dec 2023
    title: First Prize in Harting Technology Competition
    institution: Harting Technology Group
  - year: Oct 2022
    title: Outstanding Student Scholarship
    institution: Tongji University

talks:
  - title: "Sky-Drive: A Distributed Multi-Agent Simulation Platform for Socially-Aware and Human-AI Collaborative Future Transportation"
    venue: 2025 Safe Mobility Conference (Poster), Madison, WI
    year: Apr 2025

beyond:
  - title: Football
    items:
      - image: beyond/football/01.jpg
        title: "With my brothers on the pitch, 2025"
      - image: beyond/football/02.jpg
        title: "With my brothers on the pitch, 2024"
      - image: beyond/football/03.jpg
        title: "Into the final!"
      - image: beyond/football/04.jpg
        title: "The final, May 17, 2024"
      - image: beyond/football/05.jpg
        title: "Thighs of steel :)"
      - image: beyond/football/06.jpg
        title: "We are the champions!"
      - image: beyond/football/07.jpg
        title: "We are the champions, take two!"
      - image: beyond/football/08.jpg
        title: "We are the champions, take three!"
      - image: beyond/football/09.jpg
        title: "Five-a-side, wellness edition"
      - image: beyond/football/10.jpg
        title: "My boots, vol. 1"
      - image: beyond/football/11.jpg
        title: "My boots, vol. 2"
      - image: beyond/football/12.jpg
        title: "Arsenal are champions!"
        crop: top
      - image: beyond/football/13.jpg
        title: "This shirt, a gift from my girlfriend ❤️"
        crop: top
  - title: Travel
    items:
      - image: beyond/travel/01.jpg
        title: ""
      - image: beyond/travel/02.jpg
        title: ""
      - image: beyond/travel/03.jpg
        title: ""
      - image: beyond/travel/04.jpg
        title: ""
        crop: bottom
      - image: beyond/travel/05.jpg
        title: ""
      - image: beyond/travel/06.jpg
        title: ""
      - image: beyond/travel/07.jpg
        title: ""
      - image: beyond/travel/08.jpg
        title: ""
      - image: beyond/travel/09.jpg
        title: ""
      - image: beyond/travel/10.jpg
        title: ""
        crop: bottom
      - image: beyond/travel/11.jpg
        title: ""
      - image: beyond/travel/12.jpg
        title: ""
      - image: beyond/travel/13.jpg
        title: ""
      - image: beyond/travel/14.jpg
        title: ""
      - image: beyond/travel/15.jpg
        title: ""
        crop: bottom
      - image: beyond/travel/16.jpg
        title: ""
        crop: bottom
      - image: beyond/travel/17.jpg
        title: ""
        crop: bottom
  - title: Foodie
    items:
      - image: research/placeholder.svg
        title: Placeholder
        caption: One line about this photo.
      - image: research/placeholder.svg
        title: Placeholder
        caption: One line about this photo.
      - image: research/placeholder.svg
        title: Placeholder
        caption: One line about this photo.
      - image: research/placeholder.svg
        title: Placeholder
        caption: One line about this photo.
---

<div class="about-me">
  <!-- intro -->

  <h4>Education</h4>

  <div class="entry-list">
    {% for edu in page.education %}
      <div class="entry">
        <div class="entry__title">{{ edu.degree }}</div>
        <div class="entry__sub">
          {% if edu.logo %}
            <img src="{{ edu.logo | prepend: 'assets/img/' | relative_url }}" class="inline-logo" alt="{{ edu.institution }}">
          {% endif %}
          {% if edu.college %}{% if edu.college_url %}<a href="{{ edu.college_url }}">{{ edu.college }}</a>{% else %}{{ edu.college }}{% endif %}, {% endif %}{{ edu.institution }}
        </div>
        <div class="entry__meta">
          {{ edu.period }}{% if edu.advisor %} · Advisor: {% if edu.advisor_url %}<a href="{{ edu.advisor_url }}">{{ edu.advisor }}</a>{% else %}{{ edu.advisor }}{% endif %}{% endif %}
        </div>
      </div>
    {% endfor %}
  </div>

  <h4>Honors & Awards</h4>

  <div class="entry-list">
    {% for a in page.awards %}
      <div class="entry">
        <div class="entry__title">{{ a.title }}</div>
        {% if a.detail %}
          <div class="entry__sub">“{{ a.detail }}”</div>
        {% endif %}
        <div class="entry__meta">{{ a.institution }} · {{ a.year }}</div>
      </div>
    {% endfor %}
  </div>

  <h4>Talks</h4>

  <div class="entry-list">
    {% for t in page.talks %}
      <div class="entry">
        <div class="entry__title">{{ t.title }}</div>
        <div class="entry__meta">{{ t.venue }} · {{ t.year }}</div>
      </div>
    {% endfor %}
  </div>

  <h4>Service</h4>

  <div class="entry-list">
    {% for item in page.service %}
      <div class="entry">
        <div class="entry__title">{{ item.role }}</div>
        <div class="entry__sub">{{ item.venues | join: '; ' }}</div>
      </div>
    {% endfor %}
  </div>

  <h4>Beyond Research</h4>
  {% for g in page.beyond %}
    <section class="gallery" data-reveal>
      <h5 class="gallery__title">{{ g.title }}</h5>
      <div class="gallery__track" tabindex="0" role="region" aria-label="{{ g.title }} photos">
        {% for item in g.items %}
          {% assign ipath = item.image | prepend: 'assets/img/' %}
          {% capture ialt_fallback %}{{ g.title }} photo {{ forloop.index }}{% endcapture %}
          {% assign ialt = item.alt | default: item.title | default: ialt_fallback %}
          {% assign iclass = 'gallery__img' %}
          {% if item.crop %}{% assign iclass = 'gallery__img gallery__img--' | append: item.crop %}{% endif %}
          <div class="gallery__card">
            {% include figure.liquid path=ipath class=iclass alt=ialt zoomable=true loading="lazy" sizes="(min-width: 768px) 340px, 78vw" %}
            {% if item.title and item.title != '' %}<div class="gallery__card-title">{{ item.title }}</div>{% endif %}
            {% if item.caption and item.caption != '' %}<div class="gallery__card-caption">{{ item.caption }}</div>{% endif %}
          </div>
        {% endfor %}
      </div>
      <div class="gallery__controls">
        <button type="button" class="gallery__btn" data-dir="-1" aria-label="Previous {{ g.title }} photos">
          <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
        </button>
        <button type="button" class="gallery__btn" data-dir="1" aria-label="Next {{ g.title }} photos">
          <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
        </button>
      </div>
    </section>
  {% endfor %}

  <script defer src="{{ '/assets/js/gallery.js' | relative_url | bust_file_cache }}"></script>
</div>
