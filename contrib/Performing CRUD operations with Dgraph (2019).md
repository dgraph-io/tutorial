
## Schema 

```sh
name:           string @index(exact).
birth:          datetime @index(year) .
contact:        uid .
phone:          string .
email:          string .
adresses:       uid .
address:        string .
city:           string .
```

> Note: Next breaking change in Dgraph you gonna have to use [brackets] in UIDs. That means ``contact:        [uid] .`` and ``adresses:       uid .`` - This will come after 1.1 version.

## Mutations (Create Operation)

The city creation:

```JSON
{
  "set": [
    {
      "uid": "_:NewCity",
      "city.name": "Big Timber"
    }
  ]
}
```

To find the city, use the following query:

```sh
{
  myCity(func: has(city.name) {
    uid
    city.name
  }
}
```

The document creation:

```JSON
{
  "set": [
    {
      "uid": "_:NewGraph",
      "name@en": "Michael Keaton",
      "birth": "09/05/1951",
      "contact": {
        "phone": "(406) 932-5555",
        "email": "Keaton@michaelkeaton.com"
      },
      "adresses": {
        "address": "499-401 Harris St",
        "city": {
          "uid": "0x456" #Here you have to set the City's uid created in the previous step
        }
      }
    }
  ]
}
```

## Query

The base Query:

```sh
{
  data(func: eq(name@en, "Michael Keaton")) {
    name@en
    contact {
      phone
      email
    },
    adresses {
      address
      city
    }
  }
}
```

## Mutation (Update operation)

Editing the Michael Keaton's phone (use any value you wish):

```JSON
{
  "set": [
    {
      "uid": "0x01",
      "phone": "(406) 932-3335"
    }
  ]
}
```

## Delete Operations

Note that you have to grab the correct UIDs to do this operations. So you first need to query for it.

```JSON
{
  "delete": [
    {
      "uid": "0x01",
      "phone": null
    }
  ]
}
```

```JSON
{
  "delete": [
    {
      "uid": "0x02",
      "adresses": {
        "uid": "0x456"
      }
    }
  ]
}
```

```JSON
{
    "delete": [
        {
            "uid": "0x02"
        }
    ]
}
```
