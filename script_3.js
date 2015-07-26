var API = 'sears_beds_11';

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
        //console.log(value + ' ' + diff);
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
                console.log(swatch, swatches[swatch].getHex());
                /*
                 * Results into:
                 * Vibrant #7a4426
                 * Muted #7b9eae
                 * DarkVibrant #348945
                 * DarkMuted #141414
                 * LightVibrant #f3ccb4
                 */
                if(swatch == 'Vibrant' || swatch == 'Muted' || swatch == 'DarkMuted') {
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
            readURL(this, uploadCallback);
        });
    
        function uploadCallback (src, name, type) {
            $('#photo').children('div').css('background-image', 'url(' + src + ')');
            $('#photo').children('div').css('background-size', 'contain');
            $('#photo').children('div').css('background-repeat', 'no-repeat');
            $('#photo').children('div').css('background-position', 'center');
            $('#photo').children('div').data('name', name);
            $('#photo').children('div').data('type', type);
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
                        if(swatch == 'Vibrant' || swatch == 'Muted' || swatch == 'LightVibrant') {
                            var $div = buildDiv();
                            $('#swatches').append($div);
                            $div.css('background-color', swatches[swatch].getHex());
                        }
                    }
                }

            });
            
            $('#add_photo').html('Change Picture');
            $('#add_photo').css('background-color', '#4c4c4c');
            setTimeout( function(){
                $('#photo').children('div').css('opacity','1');
            }, 62);
            setTimeout( function(){
                $('#swatches').css('transform','translateY(0%)');
                $('#swatches').css('opacity','1');
            }, 125);
            $('#appliances').removeClass('hide');
            $('footer').css('justify-content', 'space-between');
            NProgress.done();
        }
    
        function buildDiv () {
            return $("<div></div>");
        }
    
        // On clicking add photo, trigger upload event
        $('#add_photo').on('click touchstart', function () {
            NProgress.start();
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
            var s_colors = [];
            $('#swatches').children('div').each( function() {
                rgb = $(this).css('background-color');
                color = getColorName(rgb, false);
                s_colors.push(color);
            });
            
            var n = 0;
            var url = "http://api.usergrid.com/deepblue/sandbox/" + API + "?ql=select * where ";
            for (color in s_colors) {
                if(n != 0) {
                    url += 'or ';
                }
                
                url += "colors = " + s_colors[color] + " ";
                n++; 
            }
            url += '&limit=50';

            $.ajax({
                method: 'GET',
                datatype: 'json',
                url: url,
                success: function (json) {
                    json = sortData(json, s_colors);
                    $('#results').children('div').children('div').html('');
                    $('#results').children('div').children('div').css('padding', '2.25em');
                    
                    if("entities" in json
                            && json["entities"]) {
                            
                            for(var i = 4; i > 0; i --) {
                                $.each(json["entities"], function(index, value) {
                                    if(value['score'] == i) {
                                        var url = value['url'];
                                        var image = value['image'];
                                        var $html = buildResult(image, url, value['name'], value['matching_colors'], value['score']);
                                        $('#results').children('div').children('div').append($html);
                                    }
                                });
                            }
                    }

                    if( $('#results').children('div').children('div').html() == '') {
                        $('#results').children('div').children('div').append('<h2 class="sfnt gry6 blck txtc">No results :(</h2>');
                    }

                    $('#results').css('transform', 'translateY(-100%)');
                }
            });
        }
    
        function sortData (json, s_color) {
            if("entities" in json
                    && json["entities"]) {
                
                $.each(json["entities"], function(index, value) {
                    value['matching_colors'] = [];
                    score = 0;
                    
                    var unique_colors = [];
                    $.each(value['colors'], function(i, el){
                        if($.inArray(el, unique_colors) === -1) unique_colors.push(el);
                    });
                    
                    var unique_s_colors = [];
                    $.each(s_color, function(i, el){
                        if($.inArray(el, unique_s_colors) === -1) unique_s_colors.push(el);
                    });
                    
                    for (i in unique_colors) {
                        for (j in unique_s_colors) {
                            if(unique_s_colors[j] === unique_colors[i]) {
                                score++;
                                value['matching_colors'].push(unique_colors[i]);
                            }
                        }
                    }
                    value['score'] = score;
                });
            }
            return json;
        }
    
        function buildResult(img, url, name, img_colors, score) {
            return $('<section class="inline-b b-whte" data-type="' + score + '">' +
                        '<header>' + buildColors(img_colors) +'</header>' +
                        '<img src="' + img + '">' +
                        '<div><p class="gry5 sfnt">' + name + '</p></div>' +
                        '<footer><a target="_blank" href=' + url + ' class="gry5 sfnt f4 btn">Continue to Sears</a></footer>' +
                    '</section>');
        }
    
        function buildColors(img_colors) {
            var html = '';
            $.each(img_colors, function(index, value) {
                html += '<div style="background-color:' + colors[value] + '"></div>';
            });
            return html;
        }
    });
