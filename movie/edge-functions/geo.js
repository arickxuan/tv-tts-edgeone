// interface EORequest extends Request {
//     eo: {
//       geo: {
//         asn: number;
//         countryName: string;
//         countryCodeAlpha2: string;
//         countryCodeAlpha3: string;
//         countryCodeNumeric: string;
//         regionName: string;
//         regionCode: string;
//         cityName: string;
//         latitude: number;
//         longitude: number;
//         cisp: string;
//       };
//       uuid: string;
//       clientIp: string;
//     };
//   }

  export function onRequest({ request }) {
    const eo = request.eo;
    let ipv4 = "";
    let ipv6 = "";

    if (eo.clientIp.indexOf(":") !== -1) {
      ipv6 = eo.clientIp
    } else {
      ipv4 = eo.clientIp
    }


    return new Response(
      JSON.stringify({
        eo,
        "ipv4": ipv4,
            "ipv6":ipv6,
      }),
      {
        headers: {
          'content-type': 'application/json; charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
