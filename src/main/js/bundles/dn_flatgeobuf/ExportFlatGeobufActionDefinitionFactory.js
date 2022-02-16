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
import Query from "esri/rest/support/Query";

export default class ExportFlatGeobufActionDefinitionFactory {

    constructor() {
        this.supportedIds = ["export-flatgeobuf-action"];
    }

    createDefinitionById(id) {
        const i18n = this._i18n.get().ui;

        if (id !== "export-flatgeobuf-action") {
            return;
        }
        return {
            id: "export-flatgeobuf-action",
            type: "button",
            label: i18n.exportActionTitle,
            icon: "icon-doc-export",
            transformer: this._transformer,
            logService: this._logService,
            startMessage: i18n.startMessage,

            isVisibleForItem(tocItem) {
                if (tocItem?.ref?.type === "feature") {
                    return true;
                }
            },

            trigger(tocItem) {
                this.logService.info({
                    message: this.startMessage
                });

                // access layer and prepare query
                const layer = tocItem.ref;
                const query = new Query();
                query.where = "1=1"; //return all
                query.returnGeometry = true;

                // query layer and push each feature into an array with added GeoJSON properties
                const geoJSONArray = [];
                layer.queryFeatures(query).then(results => {
                    const features = results.features;
                    features.forEach(feature => {
                        const geometry = this.transformer.geometryToGeojson(feature.geometry);
                        const geoJSON = {
                            "type": "Feature",
                            "geometry": geometry
                        };
                        geoJSONArray.push(geoJSON);
                    });

                    // create collection of all GeoJSON features
                    const geoJSONFeatureCollection = {
                        "type": "FeatureCollection",
                        "features": geoJSONArray
                    };

                    // serialize GeoJSON features into FlatGeobuf Uint8Array
                    const exportFlatGeobuf = flatgeobuf.geojson.serialize(geoJSONFeatureCollection);

                    // create url for FlatGeobuf data
                    const blob = new Blob(exportFlatGeobuf, {type: "octet/stream"});
                    const url = window.URL.createObjectURL(blob);

                    // download FlatGeobuf data as .fgb file
                    const flatGeobufURL = document.createElement("a");
                    flatGeobufURL.setAttribute("href", url);
                    const fileName = (tocItem.ref.title + ".fgb");
                    flatGeobufURL.setAttribute("download", fileName);
                    flatGeobufURL.style.display = "none";
                    document.body.appendChild(flatGeobufURL);
                    flatGeobufURL.click();
                    document.body.removeChild(flatGeobufURL);
                });
            }
        };
    }
}
