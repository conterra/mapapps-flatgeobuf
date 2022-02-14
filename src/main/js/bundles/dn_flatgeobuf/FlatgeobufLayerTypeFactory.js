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

export default class FlatgeobufLayerTypeFactory {

     async create(layerArguments) {
        let featureArray = [];

        const response = await fetch(layerArguments.url)
        for await (let feature of geojson.deserialize(response.body)) {
            featureArray.push(feature)
        }

        const featureGeoJSON = {
            type: "FeatureCollection",
            features: featureArray
        };

        const featureGeoJSONBlob = new Blob([JSON.stringify(featureGeoJSON)], {
            type: "application/json"
        });

        const url = URL.createObjectURL(featureGeoJSONBlob);
        const properties = Object.assign({}, layerArguments, {url: url})

         //TODO: wenn extent nicht gegeben, hier berechnen
        const layer = new GeoJSONLayer(properties);

        return {instance: layer};
    }
}
