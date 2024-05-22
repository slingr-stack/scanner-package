<table class="table" style="margin-top: 10px">
    <thead>
    <tr>
        <th>Title</th>
        <th>Last Updated</th>
        <th>Summary</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>Scanner package</td>
        <td>May 22, 2024</td>
        <td>Detailed description of the Scanner UI service.</td>
    </tr>
    </tbody>
</table>

# Overview

This package allows your SLINGR application to scan QR and barcodes.

## QuickStart

```js
pkg.scanner.functions.openScanner();
```

## UI Service

The Scanner package user a UI service to handle the responsibility to use the webcam o camera of your device.
<details>
    <summary>Click here to see the UI Service</summary>

<br>

### OAuth UI Service

The Scanner UI Service uses the cdn of `zbar-wasm` and `barcode-detector-polyfill` 

</details>

# About SLINGR

SLINGR is a low-code rapid application development platform that speeds up development, 
with robust architecture for integrations and executing custom workflows and automation.

[More info about SLINGR](https://slingr.io)

# License

This package is licensed under the Apache License 2.0. See the `LICENSE` file for more details.
