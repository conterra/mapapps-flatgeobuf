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
import FeatureLayer from "esri/layers/FeatureLayer";

export default class FlatGeobufFeatureLayerTypeFactory {

    #fgbUrl = null;
    #featureLayer = null;
    #coordinateTransformer = null;

    async create(layerArguments) {
        this.#fgbUrl = layerArguments.url;
        const properties = Object.assign({}, layerArguments, {
            source: [], url: null
        });
        const layer = this.#featureLayer = new FeatureLayer(properties);

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
        const graphics = [];
        const url = this.#fgbUrl;
        const iter = geojson.deserialize(url, fgBoundingBox, () => {
        });
        for await (const feature of iter) {
            const geometry = this._transformer.geojsonToGeometry(feature.geometry);
            const graphic = {
                geometry: geometry,
                attributes: feature.properties
            };
            graphics.push(graphic);
        }
        const featureLayer = this.#featureLayer;
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
        const featureLayer = this.#featureLayer;
        let extent = null;
        featureLayer.source.toArray().forEach((g) => {
            if (!extent) {
                extent = g.geometry.extent;
            } else {
                extent.union(g.geometry.extent);
            }
        });
        featureLayer.extent = extent;
    }
}
