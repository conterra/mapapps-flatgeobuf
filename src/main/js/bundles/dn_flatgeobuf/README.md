# dn_flatgeobuf

This bundle adds the support for FlatGeobuf layers to map.apps. It uses the library provided by FlatGeobuf.
More information: https://github.com/flatgeobuf/flatgeobuf

## Minimal Config
To load a FlatGeobuf as layer the following parameters are required. `id` and `title` can be left out but are strongly recommended.
```json
"map": {
    "layers": [
        {
            "id": "flatgeobuf",
            "type": "FLATGEOBUF",
            "url": "https://flatgeobuf.org/test/data/UScounties.fgb",
            "title": "Counties",
            "objectIdField": "FIPS"
        }
    ]
}
```

## Extended Config
This config extends the minimum config with optional optical effects, labels, transparency, a unique value renderer highlighting Texas, field information, popups and maptips.
```json
 "map": {
    "layers": [
        {
            "id": "flatgeobuf",
            "type": "FLATGEOBUF",
            "url": "https://flatgeobuf.org/test/data/UScounties.fgb",
            "title": "Counties",
            "objectIdField": "FIPS",
            "displayField": "NAME",
            "effect": [
                {
                    "scale": 36978595,
                    "value": "drop-shadow(3px, 3px, 4px)"
                },
                {
                    "scale": 18489297,
                    "value": "drop-shadow(2px, 2px, 3px)"
                },
                {
                    "scale": 4622324,
                    "value": "drop-shadow(1px, 1px, 2px)"
                }
            ],
            "labelsVisible": true,
            "labelingInfo": {
                "labelExpressionInfo": {
                    "expression": "$feature.FIPS"
                },
                "symbol": {
                    "type": "text",
                    "color": "black",
                    "haloSize": 1,
                    "haloColor": "white"
                }
            },
            "opacity": 0.5,
            "renderer": {
                "type": "unique-value",
                "field": "STATE",
                "defaultSymbol": {
                    "type": "simple-fill"
                },
                "uniqueValueInfos": [
                    {
                        "value": "TX",
                        "symbol": {
                            "type": "simple-fill",
                            "color": "blue"
                        }
                    }
                ]
            },
            "fields": [
                {
                    "name": "FIPS",
                    "alias": "FIPS",
                    "type": "oid"
                },
                {
                    "name": "NAME",
                    "alias": "Name",
                    "type": "string"
                },
                {
                    "name": "LSAD",
                    "alias": "LSAD",
                    "type": "string"
                },
                {
                    "name": "STATE",
                    "alias": "State",
                    "type": "string"
                }
            ],
            "popupTemplate": {
                "title": "County: {NAME}",
                "content": [
                    {
                        "type": "fields",
                        "fieldInfos": [
                            {
                                "fieldName": "LSAD",
                                "label": "LSAD"
                            },
                            {
                                "fieldName": "STATE",
                                "label": "State"
                            }
                        ]
                    }
                ]
            },
            "maptipTemplate": {
                "title": "County: {NAME}"
            }
        }
    ]
}
```

## Explicitly Supported FeatureLayer Properties

| Property             | Type            | Possible Values                                 | Default | Description                                 |
|----------------------|-----------------|-------------------------------------------------|---------|---------------------------------------------|
| copyright            | `String`        | Any String                                      |         | Copyright information for the layer         |
| definitionExpression | `String`        | Valid definitionExpression                      |         | Expression used to filter data of the layer |
| displayField         | `String`        | String containing layer's primary display field |         | Layer's primary display field               |
| effect               | `Effect`        | Effect or Array of Effects                      | `null`  | Styling effects                             |
| fields               | `Array`         | Array of Fields                                 |         | Fields in the layer                         |
| id                   | `String`        | Any String                                      |         | ID of the layer                             |
| labelingInfo         | `Label`         | Valid labelingInfo                              |         | Definition of labels for the layer          |
| labelsVisible        | `Boolean`       | `true` or `false`                               | `true`  | Enable/Disable layer's labels               |
| maxScale             | `Number`        | Any applicable number                           | `0`     | Maximum scale at which layer is visible     |
| minScale             | `Number`        | Any applicable number                           | `0`     | Minimum scale at which layer is visible     |
| opacity              | `Number`        | Number between 1.0 and 0                        | `1`     | Opacity of layer                            |
| popupEnabled         | `Boolean`       | `true` or `false`                               | `true`  | Enable/Disable layer's popups               |
| popupTemplate        | `PopupTemplate` | Valid popupTemplate                             |         | Definition of popups for the layer          |
| renderer             | `Renderer`      | Valid Renderer                                  |         | Apply custom rendering to layer             |
| title                | `String`        | Any String                                      |         | Title of layer                              |
| url                  | `String`        | String containing an URL                        |         | URL of the data source of the layer         |
| visible              | `Boolean`       | `true` or `false`                               | `true`  | Show/Hide layer                             |

## Known Limitations
The limitations of the above properties stated in the [ArcGIS API for JavaScript documentation](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-FeatureLayer.html#properties-summary) apply.
