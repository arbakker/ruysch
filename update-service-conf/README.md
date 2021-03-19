# README

Howto bevragen van pdok-services.json met `jq`:

```
$ cat pdok-services.json |  jq '.[] | length' # totaal aantal services
382
$ cat pdok-services.json |  jq  '[.[] | select(.serviceUrl | test("https?://geodata.nationaalgeoregister.nl"))] | length' 
314
$ cat pdok-services.json |  jq  '[.[] | select(.serviceUrl | test("https?://service.pdok.nl"))] | length'
50
$ cat pdok-services.json |  jq -r  '.[].serviceUrl'  | cut -d/ -f1,2,3 | sort -u # uniek domeinnamen
http://geodata.nationaalgeoregister.nl
https://geodata.nationaalgeoregister.nl
https://secure.geodata2.nationaalgeoregister.nl
https://service.pdok.nl
# lijst van service-urls van services op service.pdok.nl
$ cat pdok-services.json |  jq  '.[] | select(.serviceUrl | test("https?://service.pdok.nl")).serviceUrl
``` 