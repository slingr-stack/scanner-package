/****************************************************
 Scanner
 ****************************************************/

exports.openScanner = function () {
    sys.logs.info('[scanner] Scanning with ui service');
    sys.ui.sendMessage({
        scope: 'uiService:scanner.scanner',
        name: 'openScanner',
        config: {
            formats: ['code_128','qr_code'],
            closeAfterCodeScanned: true
        }
    });
}
