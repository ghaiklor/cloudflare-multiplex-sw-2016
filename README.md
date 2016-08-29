# cloudflare-multiplex-sw-2016

Technical task for CloudFlare (Aug 2016)

## Description

Service Workers are currently quickly evolving and it might be interesting to explore various ways they can be used in for the client-side performance.

For this task, I would like you to write a Service Worker that would multiplex big downloads such as video and audio files (since it’s SW, this should work for both <video> tags as well as direct downloads from the same origin) by splitting them into a few parallel chunk requests (similarly to download managers), and combining responses into one in a correct order so that this process would happen transparently for the browser.

## Known Issues

__What happens if Service Workers are not supported by browser?__

_Service Worker will not be registered and page will proceed as usual._

__What happens when original request\response with some headers will be replaced by my own request\response without them?__

_By now, I'm cloning original request with all properties in there into new `Response` object. Afterwards, I'm making partial requests via this cloned request. Concatenating response from these partial requests, I'm responding with concatenated body and headers from original `HEAD` response._

__What happens in case when server doesn't understand `Range` header and will reply with full content, but not partial one?__

_IN PROGRESS_

__What are the possible response codes and what would happen with your implementation if those are not simple 200 OK? (redirects, server errors, network errors etc.)__

_TODO_

__What penalties on the network does current implementation have on big files (e.g. movies)?__

_TODO_

__What would happen to form posts, file uploads etc. with current implementation?__

_TODO_

__What would happen to third-party requests going through your library?__

_TODO_

## License

The MIT License (MIT)

Copyright (c) 2016 Eugene Obrezkov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
