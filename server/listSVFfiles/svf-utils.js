const fetch = require('node-fetch');
const Zip = require('node-zip');
const Zlib = require('zlib');
const fs = require('fs');

let access_token = "";


  /////////////////////////////////////////////////////////
  // Get derivative data for specific URN
  //
  /////////////////////////////////////////////////////////
  exports.getManifest = async function( urn, token ) {
    access_token = token;
    const baseUrl = 'https://developer.api.autodesk.com/'
    const url = baseUrl + `modelderivative/v2/designdata/${urn}/manifest`;

    const res = await fetch(url, {
      compress: true,
      headers: { 'Authorization': 'Bearer ' + access_token },
    });
  return res.json() || {};
}


const getPathInfo = function(encodedURN) {

    const urn = decodeURIComponent(encodedURN)

    const rootFileName = urn.slice (
      urn.lastIndexOf ('/') + 1)

    const basePath = urn.slice (
      0, urn.lastIndexOf ('/') + 1)

    const localPathTmp = basePath.slice (
      basePath.indexOf ('/') + 1)

    const localPath = localPathTmp.replace (
      /^output\//, '')

    return {
      rootFileName,
      localPath,
      basePath,
      urn
    }
  }



const parseManifest = function(manifest) {

    const items = []
    const parseNodeRec = (node) => {

    const roles = [
        'Autodesk.CloudPlatform.DesignDescription',
        'Autodesk.CloudPlatform.PropertyDatabase',
        'Autodesk.CloudPlatform.IndexableContent',
        'leaflet-zip',
        'thumbnail',
        'graphics',
        'preview',
        'raas',
        'pdf',
        'lod',
      ]

      if (roles.includes(node.role)) {

        const item = {
          guid: node.guid,
          mime: node.mime
        }

        const pathInfo = getPathInfo(node.urn)

        items.push (Object.assign({}, item, pathInfo))
      }

      if (node.children) {
        node.children.forEach ((child) => { parseNodeRec (child) })
      }
    }

    parseNodeRec({
      children: manifest.derivatives
    })

    return items
  }

  /////////////////////////////////////////////////////////
  // Get derivative data for specific URN
const getDerivative = async function( urn ) {
  const baseUrl = 'https://developer.api.autodesk.com/'
  const url = baseUrl + `derivativeservice/v2/derivatives/${urn}`;
  const res = await fetch(url, { compress: true, headers: { 'Authorization': 'Bearer ' + access_token } });
  const buff = await res.buffer();
  return buff || {};
}

  const getSVFDerivatives = async function(urn) {
    const files = []
    const data = await getDerivative(urn);
    const pack = new Zip (data, { checkCRC32: true, base64: false    })
    const manifestData = pack.files['manifest.json'].asNodeBuffer()
    const manifest = JSON.parse ( manifestData.toString('utf8'))
    if (!manifest.assets) return [];

    manifest.assets.forEach((asset) => {
      // Skip SVF embedded resources
      if (asset.URI.indexOf('embed:/') === 0) return;
      files.push(asset.URI)
    })
    return files;
}

const getF2dDerivatives = async function (item) {
      const files = ['manifest.json.gz']
      const manifestPath = item.basePath + 'manifest.json.gz'
      const data = await getDerivative ( manifestPath )
      const manifestData = Zlib.gunzipSync(data)
      const manifest = JSON.parse ( manifestData.toString('utf8'));
      if (!manifest.assets) return [];

      manifest.assets.forEach((asset) => {
        // Skip SVF embedded resources
        if (asset.URI.indexOf('embed:/') === 0) return 
        files.push(asset.URI)
      })
      return files;
}



exports.getDerivatives = async function( manifest ) {

      const items = parseManifest(manifest);

      const derivativeTasks = items.map((item) => {

        switch (item.mime) {

          case 'application/autodesk-svf':
            return getSVFDerivatives( item.urn )

          case 'application/autodesk-f2d':
            return getF2dDerivatives( item )

          case 'application/autodesk-db':
            return new Promise( r => r(
              Object.assign({}, item, {
                files: [
                  'objects_attrs.json.gz',
                  'objects_vals.json.gz',
                  'objects_offs.json.gz',
                  'objects_ids.json.gz',
                  'objects_avs.json.gz',
                  item.rootFileName
                ]})));

          default:
              return new Promise( r => r(
              Object.assign({}, item, {
                files: [
                  item.rootFileName
              ]})));
        }
      })
      return await Promise.all( derivativeTasks )
  }

