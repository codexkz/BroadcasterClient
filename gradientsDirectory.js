var sheet = document.createElement('style');
var styleStr = '';
for(var degree = 0 ; degree<=32 ; degree++){
    styleStr += '.directoryEntry[data-type=Directory][data-degree="'+degree+'"]{'
             +  '  background-color: rgb('+(230-degree*8)+','+(230-degree*8)+','+(250-degree*8)+');'
             +  '  border-color: rgb('+(230-degree*8)+','+(230-degree*8)+','+(250-degree*8)+');'
             +  (degree <= 8 ? '' :'color:white;')
             +  '  border-bottom: darkgrey;'
             +  '  border-width: 1px;'
             +  '  border-style: solid;'
             +  '  border-radius: 5px;'
             +  '} '
             +  '.directoryEntry[data-type=Directory][data-degree="'+degree+'"]:active{'
             +  '  background-color: rgb('+(230-degree*8)+','+(230-degree*8)+','+(250-degree*8)+');'
             +  '  border-color: rgb('+(230-degree*8)+','+(230-degree*8)+','+(250-degree*8)+');'
             +  (degree <= 8 ? '' :'color:white;')
             +  '  border-top: white;'
             +  '  border-width: 1px;'
             +  '  border-style: solid;'
             +  '  border-radius: 5px;'
             +  '} '
} ;
sheet.innerHTML = styleStr;
document.head.appendChild(sheet);



