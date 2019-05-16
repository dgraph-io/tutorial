# Hugo Tutorials Theme

## Customizing Runnable URLs

All `Runnable` dialogs throughout site can **optionally** provide users the ability to customize the Dgraph URL posted to during a transaction request.

![RunnableUrl Demo](./static/images/runnable-url-demo.gif)

### Toggling Editable URLs

To enable editable URLs edit the Hugo configuration (`config.toml`) and set the `RunnableUrlEnabled` param to `true`.

```toml
[params]
  RunnableUrlEnabled = true
```

Any other value (or a missing entry) will disable editable URLs and use the default behavior.

## RunnableUrl

The [`RunnableUrl`](./static/js/runnable-url/index.js) class represents a robust Runnable URL object. It has the following fields and default values.

```js
class RunnableUrl {
  hash: '',
  hostName: '127.0.0.1',
  port: '8080',
  pathName: '/query',
  pathType: 'query',
  protocol: 'http:',
  search: '',
  searchParams: {},
  statics: {
    searchParams: {
      latency: true
    }
  }
}
```

Each field has a named getter/setter so values can be easily changed or retrieved. A `RunnableUrl` instance is then used to generate the full Dgraph Runnable URL using the `RunnableUrl.url` getter or the `RunnableUrl.toString()` method.

```js
const default = new RunnableUrl();
console.log(default.url);
// http://127.0.0.1:8080/query
```

## Defining Static Properties

The `RunnableUrl` class also has a field called `statics` that is an `Object` collection of property values that should be associated with and included in _every_ `RunnableUrl` instance. However, any properties of the `statics` property object **are not** visible to (or editable by) the user. For example, if every request should include a `latency=true` search parameter, in addition to whatever other user-modifications are made, the `statics` object might look like the following example.

```js
const instance = new RunnableUrl({
  searchParams: {
    foo: 'bar'
  },
  statics: {
    searchParams: {
      latency: true
    }
  }
});

console.log(instance.url);
// returns 'http://127.0.0.1:8080?foo=bar'
// UI shows above URL and allows editing of that URL, without exposing statics.

console.log(RunnableUrl.factory(instance, instance.statics).url);
// returns 'http://127.0.0.1:8080?foo=bar&latency=true'
// Passing statics to temp factory instance allows inclusion of hidden static properties.
```

## Handling Endpoint-Specific User Settings

In many situations the user may need to override a small selection of properties that makeup the overall Alpha URL. RunnableUrl intelligently parses and extracts all components of a valid URL and overrides default properties with any matching user-specified properties. However, it is necessary to differentiate between URLs and settings for each of the potential Alpha endpoints (e.g. `/query`, `/mutate`, `/alter`, etc).

RunnableUrl handles this by tracking each Alpha endpoint as a separate instance, each of which is uniquely editable by the user. Therefore, while the default URL for a `query` transaction will post to the `http://127.0.0.1:8080/query` URL, the user can override every component of the `query` URL, including the endpoint/pathname. For example, even if the user updates the `query` URL to `https://example.com:5432/runQuery?name=Alice` RunnableUrl will remember that this URL is associated with `query` transactions and will use this URL for all runnable requests that default to a `/query` endpoint type.

RunnableUrl determines the transaction type of a runnable instance through the Hugo front matter `endpoint` (or `pathName`) property. If the Hugo `endpoint` property is not specified then RunnableUrl assumes and defaults to a `/query` transaction type.

## Retaining User Data via RunnableStorage

The [`RunnableStorage`](./static/js/runnable-url/storage.js) class provides a RunnableUrl instance with helper methods to save and load its data via the browser's [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

For example, the `RunnableUrl.save()` method serializes its data to JSON then uses `RunnableStorage` to save it to disk.

```js
// ...
save() {
  RunnableStorage.set(
    `${this.constructor.name}-${this.pathType}`,
    JSON.stringify(this.toJSON())
  );
}
// ...
toJSON() {
  return {
    hash: this.hash,
    hostname: this.hostname,
    port: this.port,
    pathname: this.pathname,
    protocol: this.protocol,
    search: this.search,
    searchParams: this.searchParams,
    statics: this.statics
  };
}
```

The `static` `RunnableUrl.load()` method retrieves any existing saved data and deserializes it to create a `RunnableUrl` instance from that data.

```js
static load(overrides = {}) {
  return new this(
    JSON.parse(RunnableStorage.get(this.prototype.constructor.name)),
    overrides
  );
}
```

This retains state information for all user-defined fields between page loads across the app.

## Interface

The [`runnable.html`](./layouts/partials/runnable.html) partial checks if the `RunnableUrlEnabled` flag is set to `true` in the site config. If so, it includes the [`runnable-url.html`](./layouts/partials/runnable-url.html) partial, otherwise everything is left as default.

```html
{{ if .RunnableUrlEnabled }} {{ partial "runnable-url.html" . }} {{ else }}
<span class="pane-title">
  Endpoint: {{ $endpoint }}
</span>
{{ end }}
```

## (Optional) Front Matter Variables

Each individual post or page that uses a Runnable element can also specify optional front matter params to alter the _initial_ properties of the generated Dgraph URL. The following is the list of possible front matter variables that `RunnableUrl` will look for and use.

- `protocol`
- `hostName`
- `port`
- `endpoint` - Retained for backwards compatibility. `endpoint` and `pathName` are interchangeable, so only one must be specified to alter the pathname of the URL.
- `pathName`
- `search`
- `hash`

**Note: User-specified values will always override front matter values.**

For example, here are the default front matter variables for the [https://tour.dgraph.io/intro/3/](https://tour.dgraph.io/intro/3/) page.

```md
+++
date = "2017-04-26T22:28:55+10:00"
next = "/intro/4"
prev = "/intro/2"
title = "Load Schema"
weight = 3
endpoint = "/alter"
+++
```

RunnableUrl will generate the following URL for the `alter` endpoint transaction: `http://127.0.0.1:8080/alter?latency=true`. However, the `static` property includes `searchParams: { latency: true }` by default, which means the URL displayed to the user in the view is: `http://127.0.0.1:8080/alter`.

## Error Handling

While RunnableUrl is enabled a message is appended to the error message indicating to the user that the URL is editable.  The RunnableUrl endpoint button is also highlighted via an animation, as seen below.

![RunnableUrl Error Demo](./static/images/runnable-url-error-demo.gif)