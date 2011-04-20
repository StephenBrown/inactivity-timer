Inactivity Timer
================

Inactivity Timer tracks whether the user is active. The timer is reset when either the mousemove, keydown or mousedown events fire. Because the mousemove event fires often you can set the granularity of the timer. For instance if the user is deemed inactive after 30 minutes, then setting the accuracy to 10 seconds would be reasonable. Then the mousemove event will be attached 10 seconds after the last mousemove.

Requirements
------------

+ MooTools 1.3

Usage
-----

Create a new timer with defaults:
    timer = new InactivityTimer();
        timer.start();

Create a timer for 60 seconds and an accuracy of 5 seconds:
    timer = new InactivityTimer({
        timeout: 60000,
        eventTimeoutLength: 5000
    }).start();
