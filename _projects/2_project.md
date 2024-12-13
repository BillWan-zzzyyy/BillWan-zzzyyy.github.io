---
layout: page
title: Driving Simulation for Virtual Track Train
description: Conduct driving simulations of Virtual Track Train's hybrid control mode.
img: assets/img/drivingsimulator.jpg
importance: 1
category: Tongji University
related_publications: true
---

The virtual Track train (VTT) is a novel urban transportation solution that combines the advantages of trams and buses, operating on rubber wheels. Its core technology lies in a unique human/driverless hybrid driving mode. In the driverless mode, the train performs trajectory tracking by recognizing a virtual rail laid on the road surface, while in special conditions, manual control by a driver is required.

Due to its distinctive vehicle structure and control method, research on control algorithms and driving platforms for VTT is still relatively underdeveloped. Most related studies are focused on traditional automotive domains, which to some extent limit its promotion and application and pose potential safety risks.

This project aims to develop control methods for VTT based on an intelligent driving simulation platform, focusing on the following aspects:

1. Development of a comprehensive dynamic model for the VTT to support subsequent algorithm development and analysis.

2. Design of trajectory tracking control algorithms, encompassing guidance control and state observation.

3. Development of real-time simulation capabilities for the VTT, including the deployment of trajectory tracking algorithms, driver-in-the-loop simulations, and visualization of driving scenarios.

Our goal is to establish an intelligent driving platform specifically for VTT, develop advanced control algorithms, significantly improve their control performance, ensure safe operation, and provide strong support for the development of urban public transportation in China. This work will also contribute to advancements in intelligent transportation systems. Please refer to our publications for more information. {% cite zhengyang2024vtt %}.


<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/1.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/3.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/5.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Caption photos easily. On the left, a road goes through a tunnel. Middle, leaves artistically fall in a hipster photoshoot. Right, in another hipster photoshoot, a lumberjack grasps a handful of pine needles.
</div>
<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/5.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    This image can also have a caption. It's like magic.
</div>

You can also put regular text between your rows of images.
Say you wanted to write a little bit about your project before you posted the rest of the images.
You describe how you toiled, sweated, _bled_ for your project, and then... you reveal its glory in the next row of images.

<div class="row justify-content-sm-center">
    <div class="col-sm-8 mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/6.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm-4 mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/11.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    You can also have artistically styled 2/3 + 1/3 images, like these.
</div>

The code is simple.
Just wrap your images with `<div class="col-sm">` and place them inside `<div class="row">` (read more about the <a href="https://getbootstrap.com/docs/4.4/layout/grid/">Bootstrap Grid</a> system).
To make images responsive, add `img-fluid` class to each; for rounded corners and shadows use `rounded` and `z-depth-1` classes.
Here's the code for the last row of images above:

{% raw %}

```html
<div class="row justify-content-sm-center">
  <div class="col-sm-8 mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/6.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
  </div>
  <div class="col-sm-4 mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/11.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
  </div>
</div>
```

{% endraw %}
