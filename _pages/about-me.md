---
layout: page
permalink: /about-me/
title: About me
description: <i>A few things beyond the papers.</i>
nav: true
nav_order: 5
---

<div class="about-me">
  <p>
    Placeholder intro paragraph — replace this with a couple of sentences about
    yourself outside of research.
  </p>

  <!-- =====================================================================
       HOW TO ADD A NEW SECTION
       Copy an <h4>Title</h4> line and put your content under it.
       The short accent bar under the heading is drawn automatically by CSS.
       Use <h5>Sub-title</h5> for a smaller sub-heading inside a section.
       ===================================================================== -->

  <h4>Hobbies</h4>

  <p>Placeholder — one or two sentences about your hobbies.</p>

  <!-- ---------------------------------------------------------------------
       HOW TO ADD A PHOTO ROW
       Copy the whole <div class="row photo-row"> block. Each photo is one
       <div class="col-md-4 mt-3">, three per row. Drop your image into
       assets/img/ and change path="assets/img/YOURFILE.jpg".
       Delete the <p class="photo-caption"> line if you do not want a caption.
       --------------------------------------------------------------------- -->
  <div class="row photo-row">
    <div class="col-md-4 mt-3">
      {% include figure.liquid path="assets/img/1.jpg" class="img-fluid rounded z-depth-1" alt="Placeholder photo" %}
    </div>
    <div class="col-md-4 mt-3">
      {% include figure.liquid path="assets/img/2.jpg" class="img-fluid rounded z-depth-1" alt="Placeholder photo" %}
    </div>
    <div class="col-md-4 mt-3">
      {% include figure.liquid path="assets/img/3.jpg" class="img-fluid rounded z-depth-1" alt="Placeholder photo" %}
    </div>
  </div>
  <p class="photo-caption">Placeholder caption — replace or delete this line.</p>

  <h4>Travel</h4>

  <!-- ---------------------------------------------------------------------
       HOW TO ADD A BULLET
       Copy one <li>. The <span class="memory-date"> is optional — delete it
       if the entry has no date.
       --------------------------------------------------------------------- -->
  <ul class="memories-list">
    <li>Placeholder trip or city <span class="memory-date">(2025.09–2025.12)</span></li>
    <li>Placeholder trip or city <span class="memory-date">(2024.06)</span></li>
    <li>Placeholder trip or city</li>
  </ul>

  <div class="row photo-row">
    <div class="col-md-4 mt-3">
      {% include figure.liquid path="assets/img/4.jpg" class="img-fluid rounded z-depth-1" alt="Placeholder photo" %}
    </div>
    <div class="col-md-4 mt-3">
      {% include figure.liquid path="assets/img/5.jpg" class="img-fluid rounded z-depth-1" alt="Placeholder photo" %}
    </div>
    <div class="col-md-4 mt-3">
      {% include figure.liquid path="assets/img/6.jpg" class="img-fluid rounded z-depth-1" alt="Placeholder photo" %}
    </div>
  </div>
  <p class="photo-caption">Placeholder caption — replace or delete this line.</p>
</div>
