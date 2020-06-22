export function getCookie(sName: string): string|undefined
{
    sName = sName.toLowerCase();
    var oCrumbles = document.cookie.split(';');
    for(var i=0; i<oCrumbles.length;i++)
    {
        var oPair= oCrumbles[i].split('=');
        var sKey = decodeURIComponent(oPair[0].trim().toLowerCase());
        var sValue = oPair.length>1?oPair[1]:'';
        if(sKey === sName)
            return decodeURIComponent(sValue);
    }
    return undefined;
}

export function setCookie(sName: string, sValue: string) {
    var sCookie = encodeURIComponent(sName) + '=' + encodeURIComponent(sValue) + ';path=/';
    document.cookie= sCookie;
}


export function clearCookie(sName: string)
{
    setCookie(sName,'');
}
