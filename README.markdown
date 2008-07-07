jQuery KVO
==========

This project contains two plugins that together can be used to get key-value observing and binding, as inspired by Cocoa and SproutCore.

What's key-value observing?
---------------------------

Key-value observing allows you to be notified when an attribute value is changed on an object. Let's say you have a profile, and that profile has a number of properties, such as a name. This will update the document title according to whatever the name is set to:

    profile.kvobserve("name", function(event, newvalue, oldvalue) {
      document.title = "WidgetCorp - " + newvalue + "'s profile";
    });

What's key-value binding?
-------------------------

Key-value binding uses key-value observing to automatically update something, usually a view element, when some observable object, usually a model, has a property value change. Here's how to update a header when the profile's name changes:

    $("h1").kvobind(profile, "name");

You can even specify what's called the value path, and the kvo framework will figure out what to bind to:

    $("h1").kvobind("profile.name");

Note that this assumes that `window.profile` is the same as `profile` above.

How do I start using it?
------------------------

You can use it as in the above examples (also check out `examples.html`), but the easiest way to set everything up is with custom attributes on elements. Doing it this way, the above example becomes:

    <h1 bind="profile.name"></h1>
