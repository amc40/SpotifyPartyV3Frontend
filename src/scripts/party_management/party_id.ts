import  { expressWSAddr } from '../../constants'

export async function getNewPartyId() {
    try {
        const createPartyResponse = await fetch(expressWSAddr + '/api/party', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          if (!createPartyResponse.ok) {
              throw new Error("Response code was not ok: " + createPartyResponse.status);
          }
          const createPartyResponseContent = await createPartyResponse.json();
          console.log('fetched party id:', createPartyResponseContent.partyId)
          return createPartyResponseContent.partyId;
    } catch (e) {
        console.log(e);
        return undefined;
    }
}

