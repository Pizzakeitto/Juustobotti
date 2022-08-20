const Discord = require('discord.js')
const axios = require('axios').default
const fetch = require('node-fetch').default
const { postimitävittua } = require("../../config.json") // Something thats required????????????
const fs = require('fs')

module.exports = {
    name: 'posti',
    description: 'posti!',
    detailedDescription: 'Kattoo mis paketti on xd',
    async execute(message = Discord.Message.prototype, args = []) {
        if (!args[0]) return message.channel.send("Määritteles joku seurantakoodi nii katon mis se menee!!!! (if you cant read this, this commands not made for you :))")
        const pakettinro = args[0]
        let err = 0 //purkka

        message.channel.sendTyping()

        // anonymous token
        const tokenData = await axios.post('https://auth-service.posti.fi/api/v1/anonymous_token')
            .catch(err => {
                message.channel.send("something broke (#2)")
                console.log(err)
                err = 1
            })
        if (err) return

        const token = tokenData.data.id_token
        const roleToken = tokenData.data.role_tokens[0].token
        console.log(roleToken)

        // get paketti tietoisuus
        // En halunu käyttää täs fetch mut minkäs teet ku axios lahoo
        const res = await fetch("https://oma.posti.fi/graphql/v2", {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
                "authorization": `Bearer ${token}`,
                "content-type": "application/json",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "sec-gpc": "1",
                "x-omaposti-roles": roleToken,
                "Referer": "https://www.posti.fi/",
                "Referrer-Policy": "no-referrer-when-downgrade"
            },
            "body": `{"operationName": "getShipmentView", "variables": {"externalCode": "${pakettinro}"}, "query": "${postimitävittua}"}`,
            "method": "POST"
        }).catch(err => {
            message.channel.send("something broke (#2)")
            console.log(err)
            err = 1
        })
        if (err) return

        const pakettiData = await res.json().catch(err => {
            message.channel.send("something broke (#3)")
            console.log(err)
            err = 1
        })
        if (err) return
        
        const joo = pakettiData.data.shipmentView[0].parcel
        fs.writeFileSync("posti.json", JSON.stringify(joo, null, 4))
        const lastevent = joo.events[joo.events.length -1]
        // I hate javascript dates
        let modifiedAt = joo.modifiedAt
        modifiedAt = new Date(Date.parse(modifiedAt))
        modifiedAt.setHours(modifiedAt.getHours() + 3)
        modifiedAt = modifiedAt.toLocaleString("Helsinki")

        // Joo nyt voi ees harkita embedin rakentamist
        const embed = new Discord.EmbedBuilder

        embed.setColor("#FF8000")
        embed.setAuthor({name: "Postipaketti seuranta"})
        embed.setDescription(`${joo.status.description[0].value}\nViimeisin päivitys: ${modifiedAt}`)
        embed.addFields({name: "Lähetystunnus", value: pakettinro, inline: true})
        embed.addFields({name: "Sijainti", value: `${lastevent.city ? lastevent.city : "emmä tiiä"}`, inline: true})
        message.channel.send({embeds: [embed]})
    },
}


// fetch("https://oma.posti.fi/graphql/v2", {
//   "headers": {
//     "accept": "*/*",
//     "accept-language": "en-US,en;q=0.9",
//     "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImF1dGgucG9zdGkub3BlbmlkLmNvbm5lY3QvdjEifQ.eyJpc3MiOiJodHRwczovL2F1dGgtZXh0LnByZC5vbWFwb3N0aS5wb3N0aW5leHQuZmkvIiwiYXVkIjoiYW5vbnltb3VzIiwiZXhwIjoxNjU3ODM4MTM1LjkxNzg3NCwic3ViIjoiQW5vbnltb3VzLTY2MTIyN2JlLTc1YTktNDk5Ny04MjcxLTY0NTUyNjU2MzEwMSIsImlhdCI6MTY1NzgzNDUzNS45MTc4NzQsImF1dGhfdGltZSI6MTY1NzgzNDUzNS45MTc4NzQsImFtciI6bnVsbCwiYXpwIjpudWxsLCJzZXNzaW9uX2luZGV4IjpudWxsLCJlbWFpbCI6bnVsbCwicG9zdGkudXVpZCI6bnVsbH0.d0WWEhUZK0XDy1zShsvJTy5V-qXrMF_I7e9wb2moHt66OGooeuAiPdi0-ggxAFdEA6-jbHa9TfnGK2GyBWsTpQPeqiGVMCQHFOh5BTFxDuGW0JDh4aIFo3uqrjU0oTwbSCdkf2zC4h5hpH58wVZBtVLS9svD7CyTSY-Ps9npW1uFwZYqEsm6hsDF--vS_SiaTWrKCN3n-_3-mi9dNIPiYkRgfPBAn4Q8wzysPjtflUo-9ixQAZq21duYByROYeArYP0Pg7unsc1I6kwSlzTJT0_ITgvZFI_57xdiFzzpFmjZn814n0R3WiyVSsYHHalQGOQywH_VjYeH1ByutTskY8kF6EQFa3A4ZUrGoogAmx1dY-1pxQlu6iQ2qwF0xZ5yXqZkSkBPbrn5wjj3katvNYSe87dRPeJ_J0T2fdjV5wfLE7aLThbGnPuzGuZxBBGh9XvZiL631UmFqAVfvu2NMF69RZeo747x34uKdcZ6KiECuMO5Dxphf4jcRF7yBahI-XDQrLbcQJ0JvlSp_KmkfOAARN8T9yjl6umQ-aAP4k-11o5QwkWH3O22z8WW0SBFAOAS3xFiILaqXp83VYpI8PWgg5EFY0sCL3fihaRFFqoSgoh54wamhB_dNVcQRzo0xVx7olwYR2HHTYt8TddrKgnsqcRiwk_P8lqHPWm-4M0",
//     "content-type": "application/json",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-site",
//     "sec-gpc": "1",
//     "x-omaposti-roles": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImF1dGgucG9zdGkub3BlbmlkLmNvbm5lY3QvdjEifQ.eyJpc3MiOiJodHRwczovL2F1dGgtZXh0LnByZC5vbWFwb3N0aS5wb3N0aW5leHQuZmkvIiwiYXVkIjoiYW5vbnltb3VzIiwiZXhwIjoxNjU3ODM4MTM1LjkyMTgzMDcsInN1YiI6IkFub255bW91cy02NjEyMjdiZS03NWE5LTQ5OTctODI3MS02NDU1MjY1NjMxMDEiLCJpYXQiOjE2NTc4MzQ1MzUuOTIxODMwNywicm9sZSI6eyJ0eXBlIjoiYW5vbnltb3VzIn0sImFjY2Vzc1Rva2VuIjpudWxsfQ.FVJ10lITuGdfCQFHlofgjnQSqqIGcUAfaj5YxJuHpPNY-MmsMS8woF4il2dueBH31uAsqLpTow-9EP7_yJ3mPMi0y5PSPPqogRINmOmt85fnUnWvC1dAXl6G4ige_gjgi3BNKzV3jv8hdBeIkNRkBxgKRmEQcx4PGWXIW0J65KgtSgc9nb9NvjPBCT-hWsXHuOa36VYjv5PRSxtclX4t_oBKYpk_gog3r_EAMY14hYQPX2Nes7pM2ZvGMqxdJ9YPQPINoX900TOLLqc0DS_5l-y9Wa4pWX22rgn6UmC01TBbBueXPRB1DRnuhozeZd6cE0Az9EjVD6OLdygW269lv9aCWCFo2pF3Br2vSAV7ZSRwMzqo5XPDrp-wWRysQ7tuk8xbBIUS_yAtZjdzj9l3Tb_SLyePx2V3DFoC_cTYiuEjTx5p9Y1BkmcKDPeE0uovwwZpWqSxoDqG5c73eqSSm3wUgNp63kzLfX1xmmBbKmAZjXHKF-yUyogeSXfC0H1ReXfURxUu7_IcpGHFTR85YgT3EcfWPCfivkVrKG7gdc_bIxisvaHQioYr3O492csJoAlAAZ8ZpjznlIG-Cyzf70XNrW9yN1bARl2flVFU5vksKQJwijffbg-PVLd5oGdltre74ATRFkBj_gzRmu6pVaJwX4U9Ymi84NlMfZnPJaA",
//     "Referer": "https://www.posti.fi/",
//     "Referrer-Policy": "no-referrer-when-downgrade"
//   },
//   "body": "{\"operationName\":\"getShipmentView\",\"variables\":{\"externalCode\":\"JJFI64188120074248180\"},\"query\":\"query getShipmentView($externalCode: String) {\\n  shipmentView(externalCode: $externalCode) {\\n    id\\n    displayId\\n    displayName\\n    shipmentType\\n    userRole\\n    parcel {\\n      errandCode\\n      otherTrackingNumber\\n      estimatedDeliveryTime\\n      selectedEarliestDeliveryTime\\n      selectedLatestDeliveryTime\\n      confirmedEarliestDeliveryTime\\n      confirmedLatestDeliveryTime\\n      lastCollectionDate\\n      cashOnDelivery {\\n        amount\\n        currency\\n        __typename\\n      }\\n      postpayValue {\\n        amount\\n        currency\\n        __typename\\n      }\\n      packageQuantity {\\n        value\\n        __typename\\n      }\\n      createdAt\\n      departure {\\n        city\\n        country\\n        postcode\\n        __typename\\n      }\\n      destination {\\n        city\\n        country\\n        postcode\\n        __typename\\n      }\\n      events {\\n        city\\n        eventCode\\n        eventDescription {\\n          lang\\n          value\\n          __typename\\n        }\\n        reasonCode\\n        reasonDescription {\\n          lang\\n          value\\n          __typename\\n        }\\n        recipientSignature\\n        timestamp\\n        lockerDetails {\\n          lockerCode\\n          lockerAddress\\n          lockerDescription\\n          lockerID\\n          lockerRackID\\n          __typename\\n        }\\n        shelfId\\n        __typename\\n      }\\n      modifiedAt\\n      parties {\\n        consignee {\\n          ...party\\n          __typename\\n        }\\n        consignor {\\n          ...party\\n          __typename\\n        }\\n        delivery {\\n          ...party\\n          __typename\\n        }\\n        payer {\\n          ...party\\n          __typename\\n        }\\n        __typename\\n      }\\n      pickupPoint {\\n        availabilityTime\\n        city\\n        country\\n        county\\n        latitude\\n        locationCode\\n        longitude\\n        postcode\\n        province\\n        pupCode\\n        state\\n        street1\\n        street2\\n        street3\\n        type\\n        codPayableOnLocation\\n        __typename\\n      }\\n      references {\\n        consignor\\n        postiOrderNumber\\n        mpsCodGroup\\n        __typename\\n      }\\n      status {\\n        code\\n        description {\\n          lang\\n          value\\n          __typename\\n        }\\n        __typename\\n      }\\n      trackingNumber\\n      volume {\\n        unit\\n        value\\n        __typename\\n      }\\n      weight {\\n        unit\\n        value\\n        __typename\\n      }\\n      width {\\n        ...length\\n        __typename\\n      }\\n      height {\\n        ...length\\n        __typename\\n      }\\n      length {\\n        ...length\\n        __typename\\n      }\\n      __typename\\n    }\\n    parcelExtensions {\\n      actions {\\n        actionType\\n        actionUrl\\n        __typename\\n      }\\n      exceptions {\\n        exceptionType\\n        __typename\\n      }\\n      powerOfAttorneyStatus\\n      widget {\\n        hasWidget\\n        url\\n        __typename\\n      }\\n      displayOptions {\\n        type\\n        __typename\\n      }\\n      deliveryMethod {\\n        type\\n        __typename\\n      }\\n      senderOptions {\\n        type\\n        __typename\\n      }\\n      digitalDeclaration {\\n        status\\n        action {\\n          type\\n          url\\n          __typename\\n        }\\n        __typename\\n      }\\n      customsClearance {\\n        status\\n        __typename\\n      }\\n      general {\\n        omaPostiShipmentUrl\\n        __typename\\n      }\\n      __typename\\n    }\\n    freight {\\n      cashOnDelivery {\\n        amount\\n        currency\\n        __typename\\n      }\\n      selectedEarliestDeliveryTime\\n      selectedLatestDeliveryTime\\n      confirmedEarliestDeliveryTime\\n      confirmedLatestDeliveryTime\\n      createdAt\\n      departure {\\n        city\\n        country\\n        postcode\\n        __typename\\n      }\\n      destination {\\n        city\\n        country\\n        postcode\\n        __typename\\n      }\\n      events {\\n        city\\n        eventCode\\n        eventDescription {\\n          lang\\n          value\\n          __typename\\n        }\\n        reasonCode\\n        reasonDescription {\\n          lang\\n          value\\n          __typename\\n        }\\n        recipientSignature\\n        timestamp\\n        __typename\\n      }\\n      goodsItems {\\n        packageQuantity {\\n          unit\\n          value\\n          __typename\\n        }\\n        packages {\\n          trackingNumber\\n          events {\\n            city\\n            eventCode\\n            eventDescription {\\n              lang\\n              value\\n              __typename\\n            }\\n            reasonCode\\n            reasonDescription {\\n              lang\\n              value\\n              __typename\\n            }\\n            recipientSignature\\n            timestamp\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      modifiedAt\\n      product {\\n        additionalInfo {\\n          lang\\n          value\\n          __typename\\n        }\\n        code\\n        name {\\n          lang\\n          value\\n          __typename\\n        }\\n        __typename\\n      }\\n      references {\\n        consignor\\n        postiOrderNumber\\n        mpsCodGroup\\n        __typename\\n      }\\n      status {\\n        code\\n        description {\\n          lang\\n          value\\n          __typename\\n        }\\n        __typename\\n      }\\n      parties {\\n        consignee {\\n          ...party\\n          __typename\\n        }\\n        consignor {\\n          ...party\\n          __typename\\n        }\\n        delivery {\\n          ...party\\n          __typename\\n        }\\n        __typename\\n      }\\n      totalLoadingMeters {\\n        unit\\n        value\\n        __typename\\n      }\\n      totalPackageQuantity {\\n        unit\\n        value\\n        __typename\\n      }\\n      totalWeight {\\n        unit\\n        value\\n        __typename\\n      }\\n      totalFreightWeight {\\n        unit\\n        value\\n        __typename\\n      }\\n      totalVolume {\\n        unit\\n        value\\n        __typename\\n      }\\n      urls {\\n        longEPodUrl\\n        __typename\\n      }\\n      waybillNumber\\n      deliveryDate {\\n        ...dateRange\\n        __typename\\n      }\\n      pickupDate {\\n        ...dateRange\\n        __typename\\n      }\\n      __typename\\n    }\\n    freightExtensions {\\n      actions {\\n        actionType\\n        actionUrl\\n        __typename\\n      }\\n      displayOptions {\\n        type\\n        __typename\\n      }\\n      deliveryMethod {\\n        type\\n        __typename\\n      }\\n      __typename\\n    }\\n    aftershipParcel {\\n      courier\\n      courierData {\\n        country\\n        defaultLanguage\\n        iconUrl\\n        id\\n        name\\n        otherLanguages\\n        otherName\\n        phone\\n        url\\n        __typename\\n      }\\n      departure {\\n        city\\n        country\\n        postcode\\n        __typename\\n      }\\n      destination {\\n        city\\n        country\\n        postcode\\n        __typename\\n      }\\n      estimatedDeliveryTime\\n      selectedEarliestDeliveryTime\\n      selectedLatestDeliveryTime\\n      confirmedEarliestDeliveryTime\\n      confirmedLatestDeliveryTime\\n      events {\\n        city\\n        country\\n        eventAdditionalInfo {\\n          lang\\n          value\\n          __typename\\n        }\\n        eventCode\\n        eventDescription {\\n          lang\\n          value\\n          __typename\\n        }\\n        eventShortName {\\n          lang\\n          value\\n          __typename\\n        }\\n        postcode\\n        reasonCode\\n        timestamp\\n        __typename\\n      }\\n      modifiedAt\\n      parties {\\n        consignee {\\n          ...party\\n          __typename\\n        }\\n        consignor {\\n          ...party\\n          __typename\\n        }\\n        __typename\\n      }\\n      pickupPoint {\\n        city\\n        country\\n        postcode\\n        __typename\\n      }\\n      status {\\n        code\\n        description {\\n          lang\\n          value\\n          __typename\\n        }\\n        __typename\\n      }\\n      trackingNumber\\n      __typename\\n    }\\n    pendingTracking {\\n      courier\\n      courierData {\\n        country\\n        defaultLanguage\\n        iconUrl\\n        id\\n        name\\n        otherLanguages\\n        otherName\\n        phone\\n        url\\n        __typename\\n      }\\n      isPlusShipment\\n      modifiedAt\\n      trackingNumber\\n      waybillNumber\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment length on TrackingLength {\\n  unit\\n  value\\n  __typename\\n}\\n\\nfragment party on ShipmentViewParty {\\n  name1\\n  city\\n  country\\n  postcode\\n  state\\n  street1\\n  street2\\n  street3\\n  account\\n  __typename\\n}\\n\\nfragment dateRange on TrackingDateRange {\\n  earliest\\n  latest\\n  __typename\\n}\"}",
//   "method": "POST"
// });