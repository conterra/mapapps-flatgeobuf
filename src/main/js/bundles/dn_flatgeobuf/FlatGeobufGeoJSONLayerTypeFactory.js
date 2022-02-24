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
import {geojson} from "flatgeobuf";
import GeoJSONLayer from "esri/layers/GeoJSONLayer";

export default class FlatGeobufGeoJSONLayerTypeFactory {

    #fgbUrl = null;
    #geoJSONLayer = null;
    #coordinateTransformer = null;

    async create(layerArguments) {
        let featureArray = [];

        this.#fgbUrl = layerArguments.url;
        const response = await fetch(this.#fgbUrl);

        for await (let feature of geojson.deserialize(response.body)) {
            featureArray.push(feature);
        }

        const featureGeoJSON = {
            type: "FeatureCollection",
            features: featureArray
        };

        const featureGeoJSONBlob = new Blob([JSON.stringify(featureGeoJSON)], {
            type: "application/json"
        });

        const url = URL.createObjectURL(featureGeoJSONBlob);
        const properties = Object.assign({}, layerArguments, {url: url});
        const layer = this.#geoJSONLayer = new GeoJSONLayer(properties);

        return {instance: layer};
    }

    setMapWidgetModel(mapWidgetModel) {
        if (mapWidgetModel.view) {
            this.#watchForExtent(mapWidgetModel.view);
        } else {
            const watcher = mapWidgetModel.watch("view", ({value: view}) => {
                watcher.remove();
                this.#watchForExtent(view);
            });
        }
    }

    setCoordinateTransformer(coordinateTransformer) {
        this.#coordinateTransformer = coordinateTransformer;
    }

    #watchForExtent(view) {
        let timeout = null;
        view.watch("stationary", (response) => {
            if (response) {
                clearTimeout(timeout);

                timeout = setTimeout(() => {
                    this.#queryData(view.extent);
                }, 1000);
            }
        });
    }

    async #queryData(extent) {
        const fgBoundingBox = await this.#getFgBoundingBox(extent);
        if (!fgBoundingBox) {
            return;
        }

        let graphics = [];
        const response = await fetch(this.#fgbUrl);

        const iter = geojson.deserialize(response.body, fgBoundingBox, () => {}) ;

        for await (const feature of iter) {
            graphics.push(feature);
        }
        //
        // const featureGeoJSON = {
        //     type: "FeatureCollection",
        //     features: graphics
        // };

        const featureLayer = this.#geoJSONLayer;
        featureLayer.applyEdits({
            addFeatures: graphics
        });
        this.#updateLayerExtent();
    }

    #getFgBoundingBox(extent) {
        return new Promise((resolve) => {
            const coordinateTransformer = this.#coordinateTransformer;
            if (extent && coordinateTransformer) {
                coordinateTransformer.transform(extent, 4326).then((transformedExtent) => {
                    const bbox = {
                        minX: this.#reduceX(transformedExtent.xmin),
                        maxX: this.#reduceX(transformedExtent.xmax),
                        minY: transformedExtent.ymin,
                        maxY: transformedExtent.ymax
                    };
                    resolve(bbox);
                });
            } else {
                resolve();
            }
        });
    }

    #reduceX(x) {
        if (x > 180) {
            return this.#reduceX(x - 360);
        } else {
            return x;
        }
    }

    #updateLayerExtent() {
        const geoJSONLayer = this.#geoJSONLayer;
        let extent = null;
        geoJSONLayer.source.toArray().forEach((g) => {
            if (!extent) {
                extent = g.geometry.extent;
            } else {
                extent.union(g.geometry.extent);
            }
        });
        geoJSONLayer.extent = extent;
    }
}
