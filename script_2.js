var API = 'sears_beds_11';
// Best is 7 with swatch == 'Vibrant' || swatch == 'Muted' || swatch == 'DarkMuted'

var colors = [
    "#ffffff",
    "#fc71c7",
    "#f8e38f",
    "#f55557",
    "#f1c71f",
    "#ee38e7",
    "#eaaaaf",
    "#e71c77",
    "#e38e3f",
    "#e00007",
    "#dc71cf",
    "#d8e397",
    "#d5555f",
    "#d1c727",
    "#ce38ef",
    "#caaab7",
    "#c71c7f",
    "#c38e47",
    "#c0000f",
    "#bc71d7",
    "#b8e39f",
    "#b55567",
    "#b1c72f",
    "#ae38f7",
    "#aaaabf",
    "#a71c87",
    "#a38e4f",
    "#a00017",
    "#9c71df",
    "#98e3a7",
    "#95556f",
    "#91c737",
    "#8e38ff",
    "#8aaac7",
    "#871c8f",
    "#838e57",
    "#80001f",
    "#7c71e7",
    "#78e3af",
    "#755577",
    "#71c73f",
    "#6e3907",
    "#6aaacf",
    "#671c97",
    "#638e5f",
    "#600027",
    "#5c71ef",
    "#58e3b7",
    "#55557f",
    "#51c747",
    "#4e390f",
    "#4aaad7",
    "#471c9f",
    "#438e67",
    "#40002f",
    "#3c71f7",
    "#38e3bf",
    "#355587",
    "#31c74f",
    "#2e3917",
    "#2aaadf",
    "#271ca7",
    "#238e6f",
    "#200037",
    "#1c71ff",
    "#18e3c7",
    "#15558f",
    "#11c757",
    "#0e391f",
    "#0aaae7",
    "#071caf",
    "#038e77",
    "#000000"
]


function rgb2xyz(rgb) {
  var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255;

  // assume sRGB
  r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
  g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
  b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

  var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
  var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
  var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

  return [x * 100, y *100, z * 100];
}

function rgb2lab(rgb) {
  var xyz = rgb2xyz(rgb),
        x = xyz[0],
        y = xyz[1],
        z = xyz[2],
        l, a, b;

  x /= 95.047;
  y /= 100;
  z /= 108.883;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

  l = (116 * y) - 16;
  a = 500 * (x - y);
  b = 200 * (y - z);

  return [l, a, b];
}

//Convert to RGB, then R, G, B
function getColorName (color, isHex) {
    if(isHex == true) {
        color = hex2rgb(color);
    } else  {
        color = color.replace(/[^0-9,]/g, "");
    }
    var color_r = color.split(',')[0];
    var color_g = color.split(',')[1];
    var color_b = color.split(',')[2];
    color_lab = rgb2lab([color_r, color_g, color_b]);
    color_lab = {L: color_lab[0], A: color_lab[1], B: color_lab[2]};
    

    var min_diff = 1000;
    var min_diff_color = '';
    $.each(colors, function (index, value) {
        var base_color_rgb = hex2rgb(value);
        var base_color_r = base_color_rgb.split(',')[0];
        var base_color_g = base_color_rgb.split(',')[1];
        var base_color_b = base_color_rgb.split(',')[2];
        base_color_lab = rgb2lab([base_color_r, base_color_g, base_color_b]);
        base_color_lab = {L: base_color_lab[0], A: base_color_lab[1], B: base_color_lab[2]};

        var diff = DeltaE.getDeltaE00(color_lab, base_color_lab);
        if(diff < min_diff) {
            min_diff = diff;
            min_diff_color = index;
        }
    });
    return min_diff_color;
}

//Function to convert HEX to RGB
function hex2rgb(colour) {
    var r, g, b;
    if (colour.charAt(0) == '#') {
        colour = colour.substr(1);
    }

    r = colour.charAt(0) + colour.charAt(1);
    g = colour.charAt(2) + colour.charAt(3);
    b = colour.charAt(4) + colour.charAt(5);

    r = parseInt(r, 16);
    g = parseInt(g, 16);
    b = parseInt(b, 16);
    return r + ',' + g + ',' + b;
}

function getColors(src, callback) {
    var arr = [];
    var img = document.createElement('img');
    img.setAttribute('src', src);

    img.addEventListener('load', function() {
        var vibrant = new Vibrant(img);
        var swatches = vibrant.swatches();
        for (swatch in swatches) {
            if (swatches.hasOwnProperty(swatch) && swatches[swatch]) {
                //console.log(swatch, swatches[swatch].getHex());
                /*
                 * Results into:
                 * Vibrant #7a4426
                 * Muted #7b9eae
                 * DarkVibrant #348945
                 * DarkMuted #141414
                 * LightVibrant #f3ccb4
                 */
                
                if(swatch == 'Vibrant' || swatch == 'Muted' || swatch == 'LightVibrant') {
                    arr.push(getColorName(swatches[swatch].getHex(), true));
                }
            }
        }
        callback(arr);
    });
}

$(document)
    .ready(function () {
        // On clicking to upload a photo 
        $("#upload").change(function() {
            NProgress.start();
            readURL(this, uploadCallback);
        });
    
        function uploadCallback (src, name, type) {
            $('#photo').css('background-image', 'url(' + src + ')');
            $('#photo').css('background-size', 'contain');
            $('#photo').css('background-repeat', 'no-repeat');
            $('#photo').css('background-position', 'center');
            $('#photo').data('name', name);
            $('#photo').data('type', type);
            $('#swatches').html('');
            
            var img = document.createElement('img');
            img.setAttribute('src', src);

            img.addEventListener('load', function() {
                var vibrant = new Vibrant(img);
                var swatches = vibrant.swatches()
                for (swatch in swatches) {
                    if (swatches.hasOwnProperty(swatch) && swatches[swatch]) {
                        //console.log(swatch, swatches[swatch].getHex());
                        /*
                         * Results into:
                         * Vibrant #7a4426
                         * Muted #7b9eae
                         * DarkVibrant #348945
                         * DarkMuted #141414
                         * LightVibrant #f3ccb4
                         */
                        if(swatch == 'Vibrant' || swatch == 'Muted' || swatch == 'LightVibrant' || swatch == 'DarkVibrant') {
                            var $div = buildDiv();
                            $('#swatches').append($div);
                            $div.css('background-color', swatches[swatch].getHex());
                        }
                    }
                }

            });
            
            $('#add_photo').html('Change Picture');
            $('#add_photo').css('background-color', '#4c4c4c');
            $('#appliances').removeClass('hide');
            $('footer').css('justify-content', 'space-between');
            NProgress.done();
        }
    
        function buildDiv () {
            return $("<div></div>");
        }
    
        // On clicking add photo, trigger upload event
        $('#add_photo').on('click touchstart', function () {
            $('#upload').click();
        });
    
        $('#appliances').on('click touchstart', function () {
            getSearchColors();
        });
    
        $('#close').on('click touchstart', function () {
            $('#results').css('transform', 'translateY(100%)');
        });
    
        var n = 0;
        function getSearchColors() {
            $('#swatches').children('div').each( function() {
                rgb = $(this).css('background-color');
                sears_color = getColorName(rgb, false);
                /*var url = "http://www.sears.com/service/search/productSearch?catalogId=12605&catgroupIdPath=1348654256_1348856843_1348879842&frmPg=dis&keyword=&levels=Home_Furniture_Living+Room+Furniture&searchBy=keyword&storeId=10153&tabClicked=All&endIndex=1000";
                /*var url = "http://api.developer.sears.com/v2.1/products/browse/products/Sears/json?category=Outdoor%20Living|Patio%20Furniture|Bars&filterName=Color%20Family&filter=Color%20Family%7C" "&apikey=t4ll0yJp3atAaS8SE9eYvjLcJd77jiGv&endIndex=1000";*/
                var url = "http://www.sears.com/service/search/productSearch?catalogId=12605&catgroupId=1348744781&catgroupIdPath=1348654256_1348688603_1348734843_1348744781&levels=Home_Bed+%26+Bath_Bedding_Comforters&primaryPath=Home_Bed+%26+Bath_Bedding_Comforters&searchBy=subcategory&sortOption=UNITS_HIGH_TO_LOW&storeId=10153&tabClicked=All&viewItems=700";
                //var url = "http://www.sears.com/service/search/productSearch?catalogId=12605&catgroupId=1348744781&catgroupIdPath=1348654256_1348688603_1348734843_1348744781&levels=Home_Bed+%26+Bath_Bedding_Comforters&primaryPath=Home_Bed&searchBy=subcategory&sortOption=UNITS_HIGH_TO_LOW&storeId=10153&tabClicked=All&viewItems=800";
                //http://www.sears.com/service/search/productSearch?catalogId=12605&catgroupId=1024058&catgroupIdPath=1024037_1024038_1024058&levels=Outdoor+Living_Patio+Furniture_Casual+Seating+Sets&pageNum=3&primaryPath=Outdoor+Living_Patio+Furniture_Casual+Seating+Sets&searchBy=subcategory&sortOption=UNITS_HIGH_TO_LOW&storeId=10153&tabClicked=All&viewItems=200
                
                $.ajax({
                    method: 'GET',
                    datatype: 'json',
                    url: url,
                    success: function (json) {
                        $('#results').children('div').children('div').html('');
                        if("products" in json
                                && json["products"]) {
                                $('#results').children('div').children('div').css('padding', '2.25em');

                                $.each(json["products"], function(index, value) {
                                    var url = 'http://sears.com/s/p-' + value['partNumber'];
                                    var image = value['image'].replace('http:', 'https:');
                                    var html = buildResult(image, url, value['name']);
                                    $('#results').children('div').children('div').append(html);
                                    
                                    getColors(image, function(arr) {
                                        var data = {
                                            "url" : url,
                                            "image" : image,
                                            "name" : value['name'],
                                            "colors" : arr
                                        }

                                        $.ajax({
                                            url: 'http://api.usergrid.com/deepblue/sandbox/' + API,
                                            method: 'POST',
                                            data: JSON.stringify(data),
                                            contentType: 'application/json; charset=utf-8',
                                            dataType: 'json',
                                            success: function () {
                                                n++;
                                                console.log(n);
                                            }
                                        });
                                    });
                                });
                        }
                        
                        if( $('#results').children('div').children('div').html() == '') {
                            $('#results').children('div').children('div').append('<h2 class="sfnt gry6 blck txtc">No results :(</h2>');
                        }
                        
                        $('#results').css('transform', 'translateY(-100%)');
                    }
                });
            });
        }
    
        function buildResult(img, url, name) {
            return '<section class="inline-b b-whte">' +
                        '<img src="' + img + '">' +
                        '<div><p class="gry5 sfnt">' + name + '</p></div>' +
                        '<footer><a target="_blank" href=' + url + ' class="gry5 sfnt f4 btn">Continue to Sears</a></footer>' +
                    '</section>';
        }
    });
