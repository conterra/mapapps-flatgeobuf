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

export default class FlatgeobufLayerTypeFactory {

    async create(layerArguments) {
        const graphics = [];

        const response = await fetch(layerArguments.url);
        for await (const feature of geojson.deserialize(response.body)) {
            const geometry = this._transformer.geojsonToGeometry(feature.geometry);
            const graphic = {
                geometry: geometry,
                attributes: feature.properties
            };
            graphics.push(graphic);
        }

        const properties = Object.assign({}, layerArguments, {source: graphics, url: null});
        const layer = new FeatureLayer(properties);

        // calculate extent
        if (!layer.extent) {
            let extent = null;
            layer.source.toArray().forEach((g) => {
                if (!extent) {
                    extent = g.geometry.extent;
                } else {
                    extent.union(g.geometry.extent);
                }
            });
            layer.extent = extent;
        }

        return {instance: layer};
    }
}
