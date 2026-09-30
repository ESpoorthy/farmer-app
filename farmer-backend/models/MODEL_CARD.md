# Plant disease inference model

AgriN Connect uses the `imaflower/plantvillage-mobilenetv3` ONNX export for
on-device-style server inference. The model is MIT licensed and is trained on
PlantVillage-labelled leaf images.

## Supported classes

The bundled model recognises healthy leaves and diseases for bell pepper,
potato, and tomato. It is not a general-purpose diagnosis engine. Results
below 65% confidence are returned as **Uncertain** rather than a disease name.

## Responsible use

Predictions are decision support only; the interface directs farmers to local
agricultural extension services before treatment. Model evaluation should use
field imagery such as PlantDoc (CC BY 4.0) and farmer-consented images, with
crop/condition labels verified by an agronomist.

## Attribution

- PlantVillage: Mohanty, Hughes, and Salathé (2016), CC BY-SA 3.0.
- Model: `imaflower/plantvillage-mobilenetv3`, MIT license.
