---
title: "Steel Arteries: Visualizing Freight Flows in New York City"
description: "aka Big Rigs in the Big Apple, aka Empire Freight of Mind"
date: 2025-04-29
slug: steel-arteries
tags: ["nyc", "data-visualization", "infrastructure", "transportation"]
---

<video src="https://bucket.thomasdhughes.com/steel-arteries-20260225-170621.mp4" autoplay loop muted playsinline></video>

[Steel Arteries](/steel-arteries-viz) is a visualization of freight truck movement through the neighborhoods of New York City over the course of an average day. It captures the projected concentration of trucks in each neighborhood, as well as what industry they're contributing to.

*Steel Arteries is live at [thomasdhughes.com/steel-arteries-viz](/steel-arteries-viz). The code can be found [here](/nyc-freight-code).*
### The Story

There's [this terrific paper](https://cip.tandoncsmart.com/uploads/1694025758042-Chow_CityTruckRouteNetwork_2023.pdf) from NYU's C2Smart Center in which a team of researchers used a method called entropy maximization in order to generate a synthetic freight truck population dataset for New York City. (Please don't stop reading, I will use far smaller words going forward.)

The idea here is that it'd be helpful if - when making policy related to or building physical things around roads, bridges, buildings, sidewalks, cars, trucks, bikes, you name it - we had a clear idea of how big ol' freight trucks actually move through the city. You could do this manually: tag along with a few truck drivers and see what their routes look like, where they go and what they deliver. But with there being thousands of trucks, you'd need a fleet of people to even get started, and this is cumbersome and expensive.

So instead of following real trucks, the researchers pulled together all the freight data they could find and used it to simulate thousands of truck routes. The individual trucks aren't real, but the overall patterns they create look a lot like what actually happens across neighborhoods and boroughs. (You can read more about how they did this [here](https://c2smarter.engineering.nyu.edu/a-peek-under-the-hood-how-we-built-a-freight-model-of-new-york-city/))

This made a whole bunch of other really cool research possible. The original paper looked at how the lifespan of bridges in the city would change if all trucks were made 20% smaller, and Haggai Davis III and Joseph Chow used the dataset to figure out what percentage of delivery routes were short enough that they could be completed on one charge of an electric truck, proving widespread electrification of the freight industry in NYC is more than feasible (paper [here](https://link.springer.com/chapter/10.1007/978-3-031-82818-8_51)).

I loved this paper. I liked the idea of simulating thousands of trucks moving around the city, and using it to drive real policy change won me over further. **But I wanted to see it!** And that's what this project was :)

### The Data

This is the journey from the data we started with to the data which underlies the visualization.

(I did all the data work in [this notebook](/steel-arteries-data) if you want to follow along)

I grabbed the dataset from the original paper [here](https://zenodo.org/records/8000176). I've put a sample row from the dataset below, with all the irrelevant or empty columns stripped away. Let's take a look.

|        | NAICS | Start Time | Trip Time.1 | Service Time.1 |    Lat1 |   Long1 |     Lat2 |   Long2 |
| -----: | ----: | ---------: | ----------: | -------------: | ------: | ------: | -------: | ------: |
| 190281 |   441 |    5.09994 |    0.554505 |            0.5 | -73.852 | 40.8799 | -73.8553 | 40.8759 |

**Step 1: Understand the Data**

- (Note: the terminology here (Routes, Trips, etc.) is not from the original paper. I made these terms to help me understand what's happening.)
- Every row represents a single truck on its Route.
	- A Route (what a truck does over the course of a day) is made up of Trips.
	- A Trip is a truck traveling from a departure point to a destination point.
- The NAICS code maps to an industry, so it tells you what industry the truck's deliveries are related to (e.g. utilities, apparel manufacturing, etc.).
- All time is in hours.
- Start Time is when the truck starts its Route. In this case, 5.09994 hours after midnight, so 5:06am.
- Trip Time is how long it takes the truck to travel from its departure point to its destination. 0.554505 hours is 33 minutes.
- Service Time is how long the truck spends at its destination before it leaves for its next destination. 0.5 hours is 30 minutes.
	- Note: from what I can tell in messing with the dataset, the Service Time is always 30 mins. My guess is that it's a separate and nontrivial problem to predict how long a truck remains at a destination when it makes a delivery.
- Lat and Long columns tell you the coordinates (latitude and longitude) of where the truck begins its Route and each stop it makes throughout the day.
- Now we've got enough info to say what this truck's day looks like: Truck 190281 is making deliveries for the Motor Vehicle and Parts Dealers industry. Its route begins at 5:06am, and it drives for 33 minutes to its first (and only) destination. It arrives at 5:39am, and remains at its destination for 30 minutes, until 6:10am. (Note: I've removed the remaining Trips and destinations from this row to simplify the example. Most trucks make more than one Trip on their Route.)

This is the data we start with. The data we want to get to (such that we can visualize it) is **how many trucks from each industry are in each neighborhood for each minute of the day.** Ideally, we have this in such a lightweight format that the visualization can be snappy and responsive even as a statically-hosted fully client-side app.

**Step 2: Turn Coordinates into Neighborhoods**

The City of New York maintains the NYC OpenData Project, which provides all types of fantastic datasets on the city that never sleeps. I took every pair of coordinates (Lat/Long pairs from the table above) and checked which neighborhood they fell into using [this GeoJSON dataset](https://data.cityofnewyork.us/City-Government/2020-Neighborhood-Tabulation-Areas-NTAs-/9nt8-h7nd/about_data) of the boundaries of every NYC neighborhood. I used this same GeoJSON file to draw the neighborhood boundaries in the final visualization.

This tells us in which neighborhoods trucks begin and end each Trip, but what about when they're on the road? How do we know where they are?

**Step 3: Split Trips in Half**

For the sake of simplicity, I just split every Trip in half, between the departure neighborhood and the destination neighborhood.

Say Truck 123 leaves East Village at 5:00am, and drives 10 minutes to Greenwich Village. There are no other trucks on the road.
- From 5:00am to 5:05am (for the first 5 mins of the Trip):
	- Trucks in East Village: 1
	- Trucks in Greenwich Village: 0
- From 5:06am to 5:10am (for the latter 5 mins of the Trip):
	- Trucks in East Village: 0
	- Trucks in Greenwich Village: 1

After this step, we know the ranges of time for which each truck is in which neighborhood (e.g. 5:00am to 5:05am is in East Village). We can extrapolate from this to figure out how many trucks are in a given neighborhood at every minute of the day. Now we have to format this data so its accessible for use in the visualization.

**Step 4: Assemble the JSON**

I made one JSON file for each industry, where the name of the file is the NAICS code of that industry. Here's a snippet from 211.json (Oil and Gas sector).

```
[{
  "Time":"12:00am",
  "Total":103,
  "Greenpoint":1,
  "Williamsburg":0,
  "South Williamsburg":0,
  ...
},
{
  "Time":"12:01am",
  "Total":104,
  "Greenpoint":1,
  "Williamsburg":1,
  "South Williamsburg":0,
  ...
},
```

Each item represents a minute of the day, and contains the total number of freight trucks on the road for that industry across all neighborhoods, and the quantity associated with each neighborhood.

And there you have it! When the user selects an industry in the visualization, we load the relevant file and adjust the gradients of the neighborhoods based on how many trucks are in each one.

### The Point

The network of freight trucks moving around New York City everyday is too much for any urban planner or policymaker to fully wrap their head around. But if we can see and interact with this flow, we've got a better shot at understanding it, and using that understanding to make smarter decisions about the infrastructure we build.

It also doubles as a pretty groovy screensaver.

-Thomas

---

*Thank you to NYU's C2Smart Center and the original team of researchers for making such a rich dataset and giving it to the world! And thank you to the maintainers of the NYC OpenData Project for providing the foundation for all data-driven research on the windy city!*

*Thank you Malaika, Renee, Andrew, and Jess for staring at the same map of NYC for hours in the forum as I wringed your minds out for UX recommendations, and D-Clunch for bringing chocopies to B3 as I tried to finish this.*

*Thank you New York for being such a fascinating piece of the planet.*
