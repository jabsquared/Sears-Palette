var sears_colors = {
    'Black': '#000000',
    'Blue': '#0000FF',
    'Gray': '#808080',
    'Metallic': '#BCC6CC',
    'Red': '#ff0000',
    'Slate': '#574E49',
    'Stainless Steel': '#E0DFDB',
    'White': '#ffffff',
    'Yellow': '#ffff00',
    'Beige & Bisque': '#f5f5dc',
    'Green': '#00ff00',
    'Brown': '#964B00',
    'Orange': '#ffa500',
    'Pink': '#ff69b4',
    'Purple': '#551a8b',
    'Neutral': '#C0B097',
    'Silver': '#CCCCCC',
    'Beige & Tan': '#d2b48c',
    'Copper' : '#C87533',
    'Green' : '#ffd700',
    'Gold': '#ffd700'
}

//Convert to RGB, then R, G, B
function getSearsColor (color) {
    color = color.replace(/[^0-9,]/g, "");
    var color_r = color.split(',')[0];
    var color_g = color.split(',')[1];
    var color_b = color.split(',')[2];

    //Convert the HEX color in the array to RGB colors, split them up to R-G-B, then find out the difference between the "color" and the colors in the array
    var min_diff = 766;
    var min_diff_color = '';
    $.each(sears_colors, function (index, value) {
        var base_color_rgb = hex2rgb(value);
        var base_colors_r = base_color_rgb.split(',')[0];
        var base_colors_g = base_color_rgb.split(',')[1];
        var base_colors_b = base_color_rgb.split(',')[2];

        var diff = Math.sqrt((color_r - base_colors_r) * (color_r - base_colors_r) + (color_g - base_colors_g) * (color_g - base_colors_g) + (color_b - base_colors_b) * (color_b - base_colors_b));
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

//alert(min_diff_color);

function buildImg(src, file_name, type) {
    return '<div><img data-type="' + type + '" data-name="' + file_name + '" src=' + src + '></div>';
}

$(document)
    .ready(function () {
        // On clicking to upload a photo 
        $("#upload").change(function() {
            NProgress.start();
            readURL(this, uploadCallback);
        });
    
        function uploadCallback (src, name, type) {
            $('#photo').children('div').css('background-image', 'url(' + src + ')');
            $('#photo').children('div').css('background-size', 'contain');
            $('#photo').children('div').css('background-repeat', 'no-repeat');
            $('#photo').children('div').css('background-position', 'center');
            console.log('url(' + src + ') contain');
            $('#photo').children('div').data('name', name);
            $('#photo').children('div').data('type', type);
            $('#swatches').html('');
            
            var img = document.createElement('img');
            img.setAttribute('src', src);
            img.setAttribute('crossOrigin', 'anonymous');

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
                        if(swatch == 'Vibrant' || swatch == 'DarkVibrant' || swatch == 'DarkMuted') {
                            var $div = buildDiv();
                            $('#swatches').append($div);
                            $div.css('background-color', swatches[swatch].getHex());
                        }
                    }
                }

            });
            
            $('#add_photo').html('Change Picture');
            $('#add_photo').css('background-color', '#4c4c4c');
            $('#swatches').css('transform','translateY(0%)');
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
    
    
        function getSearchColors() {
            $('#swatches').children('div').each( function() {
                rgb = $(this).css('background-color');
                sears_color = getSearsColor(rgb);
                var url = "http://www.sears.com/service/search/productSearch?catalogId=12605&catgroupIdPath=1348654256_1348856843_1348879842&filter=Color+Family%7C" + encodeURIComponent(sears_color) + "&frmPg=dis&keyword=&levels=Home_Furniture_Living+Room+Furniture&searchBy=keyword&storeId=10153&tabClicked=All";
                /*var url = "http://api.developer.sears.com/v2.1/products/browse/products/Sears/json?category=Outdoor%20Living|Patio%20Furniture|Bars&filterName=Color%20Family&filter=Color%20Family%7C" "&apikey=t4ll0yJp3atAaS8SE9eYvjLcJd77jiGv&endIndex=1000";*/
                console.log(url);
                
                $.ajax({
                    method: 'GET',
                    datatype: 'json',
                    url: url,
                    success: function (json) {
                        console.log(sears_color);
                        $('#results').children('div').children('div').html('');
                        if("products" in json
                                && json["products"]) {
                                $('#results').children('div').children('div').css('padding', '2.25em');

                                $.each(json["products"], function(index, value) {
                                    var url = 'http://sears.com/s/p-' + value['partNumber'];
                                    var html = buildResult(value['image'], url, value['name']);
                                    $('#results').children('div').children('div').append(html);
                                });
                        } else  {
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
                        '<img src=' + img + '>' +
                        '<div><p class="gry5 sfnt">' + name + '</p></div>' +
                        '<footer><a target="_blank" href=' + url + ' class="gry5 sfnt f4 btn">Continue to Sears</a></footer>' +
                    '</section>';
        }
    });
