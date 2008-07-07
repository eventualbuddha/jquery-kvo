jQuery KVO
==========

This project contains two plugins that together can be used to get key-value observing and binding, as inspired by Cocoa and SproutCore.

What's key-value observing?
---------------------------

Key-value observing allows you to be notified when an attribute value is changed on an object. Let's say you have a profile, and that profile has a number of properties, such as a name. This will update the document title according to whatever the name is set to:

    $(profile).kvobserve("name", function(event, newvalue, oldvalue) {
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

Creating the `profile` object is easy too:

    window.profile = $.kvo.build({name: "eventualbuddha"});

Now in any of your javascript code you can simply do this:

    profile.name = "indirect";

And everything observing will be notified of the change, and everything bound to it will be updated.

How does this work?
-------------------

While reading the source is probably the best way to answer this question, the basic idea is that a custom event is attached to the `kvo` objects that is triggered when a property is updated. Here's a simplified low-level equivalent of `kvobind`:

    $(profile).bind("kvo-name-set", function(){ alert("value changed to "+this.name) });

While ordinarily you'll be interacting with objects built with `$.kvo.build`, you can drop to the lower level if you want and build your own objects:

    var obj = new Object();
    $(obj).kvobserve("name", function(event, newvalue){ alert("value changed to "+newvalue) });
    $(obj).kvo("name", "Quincy"); // alerts the new value
    $(obj).kvo("name"); // returns "Quincy"

Objects built using `$.kvo.build` provide getters and setters that work in all major browsers, including Internet Explorer:

    var obj = $.kvo.build({name: "Quincy"});
    $(obj).kvobserve("name", function(event, newvalue){ alert("value changed to "+newvalue) });
    obj.name = "John"; // alerts the new value

Using `$.kvo.build` is the preferred way to create kvo objects.

I thought IE didn't support getters and setters...
--------------------------------------------------

It doesn't, in *javascript*, but it does in *vbscript*. In order to provide support for getters and setters in IE, `$.kvo.build` has to return a VBScript object, which means that it doesn't behave quite the same way that javascript objects do. So you can't do this and expect it to work in IE:

    var obj = $.kvo.build({name: "Quincy"});
    obj.foo = "bar";

Since it will try to invoke a setter named `foo`, but there isn't one, so you will get an error saying "Object doesn't support this property or method". This means that you must define all your properties and methods up front, or just don't use `$.kvo.build` and use `obj.kvo` to get and set values.
