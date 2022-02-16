/*
 * Copyright (C) 2022 con terra GmbH (info@conterra.de)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as flatgeobuf from "flatgeobuf";

/**
 * Method to query all features from FeatureLayer.
 *
 * @param layer
 * @returns {*}
 */
const queryAllFeaturesFromLayer = (layer) => {
    const query = {
        where: "1=1",
        returnGeometry: true,
        outFields: ["*"]
    };
    return layer.queryFeatures(query).then((result) => result.features);
};

/**
 * Method to convert Esri Features to GeoJSON.
 *
 * @param features
 * @param geojsonTransformer
 * @param coordinateTransformer
 * @returns {{features: *, type: string}}
 */
const getGeoJSONFeatureCollection = async (features, geojsonTransformer, coordinateTransformer) => {
    const promises = features.map(feature => new Promise((resolve) => {
        coordinateTransformer.transform(feature.geometry, 4326).then((transformedGeometry) => {
            const geometry = geojsonTransformer.geometryToGeojson(transformedGeometry);
            resolve({
                "type": "Feature",
                "geometry": geometry,
                "properties": feature.attributes
            });
        });
    }));
    return Promise.all(promises).then((geoJSONFeatures) => {
        return {
            "type": "FeatureCollection",
            "features": geoJSONFeatures
        };
    });
};

/**
 * Method to save FlatGeobuf-File.
 *
 * @param flatGeobufBinary
 * @param title
 */
const saveAsFGB = (flatGeobufBinary, title) => {
    const blob = new Blob([flatGeobufBinary], {type: "application/octet-stream"});
    const url = window.URL.createObjectURL(blob);
    const flatGeobufURL = document.createElement("a");
    flatGeobufURL.setAttribute("href", url);
    const fileName = (title + ".fgb");
    flatGeobufURL.setAttribute("download", fileName);
    flatGeobufURL.style.display = "none";
    document.body.appendChild(flatGeobufURL);
    flatGeobufURL.click();
    document.body.removeChild(flatGeobufURL);
};

const getFlatGeobufBinary = (geoJSONFeatureCollection, geojson) => geojson.serialize(geoJSONFeatureCollection);

export default class ExportFlatGeobufActionDefinitionFactory {

    constructor() {
        this.supportedIds = ["export-flatgeobuf-action"];
    }


    createDefinitionById(id) {
        const i18n = this._i18n.get().ui;
        const logService = this._logService;
        const transformer = this._transformer;
        const coordinateTransformer = this._coordinateTransformer;


        if (id !== "export-flatgeobuf-action") {
            return;
        }
        return {
            id: "export-flatgeobuf-action",
            type: "button",
            label: i18n.exportActionTitle,
            icon: "icon-doc-export",
            startMessage: i18n.startMessage,

            isVisibleForItem(tocItem) {
                if (tocItem?.ref?.type === "feature") {
                    return true;
                }
            },

            async trigger(tocItem) {
                logService.info({
                    message: this.startMessage
                });
                const features = await queryAllFeaturesFromLayer(tocItem.ref);
                const geoJSONFeatureCollection = await getGeoJSONFeatureCollection(
                    features, transformer, coordinateTransformer);
                const flatGeobufBinary = getFlatGeobufBinary(geoJSONFeatureCollection, flatgeobuf.geojson);
                saveAsFGB(flatGeobufBinary, tocItem.ref?.title || tocItem.ref?.id);
            }
        };
    }
}
