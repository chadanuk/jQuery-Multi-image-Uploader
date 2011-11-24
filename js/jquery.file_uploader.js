
/*
	File uploader
	@author Daniel Chadwick
	@copyright Giant Peach Design 2011
	@version 1.0
*/

(function($){
 
    //Attach this new method to jQuery
    $.fn.extend({
         
        //This is where you write your plugin's name
        fileUploader: function(options) {
 
            //Set the default values, use comma to separate the settings, example:
            var defaults = {
					use_drop:false,
					only_images:true,
					max_width:1000,
					max_height:false,
					save_url: 'upload.php',
					afterSave: function(){}
				};
				var options =  $.extend(defaults, options);

				
	            //Iterate over the current set of matched elements
				return this.each(function()
				{
					var files_uploaded = '';
					var preview;
					var drop;	
					var o = options;
					var is_multiple = false;
					
					var handle_file = function(file, counter, progress) 
					{
						var prog_box = progress.parents('div.fu_progress_bar');

						progress.css({width: '70%'});
						progress.html('70%');


						var img = $('<img id=photo_img_'+counter+' />');
						var img_name = $('<input type=hidden name=photo_img value="' + counter + '">');
						var caption = $('<textarea id=photo_caption_'+counter+' name=photo_caption['+counter+']></textarea>');
						var credit = $('<input type=text id=photo_credit_'+counter+' name=photo_credit['+counter+']>');

						// get EXIF data
						var binaryReader = new FileReader();
						binaryReader.onloadend = function() 
						{
							if (typeof findEXIFinJPEG !== 'function') 
							{
								console.log('exif js not loaded correctly');
								return;
							};
							var exif = findEXIFinJPEG(binaryReader.result);
							$(caption).val( exif['ImageDescription'] );
							$(credit).val( exif['Artist'] );
						}
						binaryReader.readAsBinaryString(file);

						var reader = new FileReader();
						reader.onloadend = function() 
						{
							progress.css({width: '82%'});
							progress.html('82%');
							
							$(img).attr('src', reader.result);

							// resize  
							var tempImg = new Image();
							tempImg.src = reader.result;
							tempImg.onload = function() {

								var MAX_WIDTH = (o.max_width && o.max_width < tempImg.width) ? (o.max_width) : (tempImg.width);
								var MAX_HEIGHT = (o.max_height && o.max_height < tempImg.height) ? (o.max_height) : (tempImg.height);
								var tempW = tempImg.width;
								var tempH = tempImg.height;
								if (tempW > tempH) {
									if (tempW > MAX_WIDTH) {
										tempH *= MAX_WIDTH / tempW;
										tempW = MAX_WIDTH;
									}
								} 
								else {
									if (tempH > MAX_HEIGHT) {
										tempW *= MAX_HEIGHT / tempH;
										tempH = MAX_HEIGHT;
									}
								}

								var canvas = document.createElement('canvas');
								canvas.width = tempW;
								canvas.height = tempH;
								var ctx = canvas.getContext("2d");
								ctx.drawImage(this, 0, 0, tempW, tempH);

								// upload
								progress.css({width: '91%'});
								progress.html('91%');
								
								var dataURL = canvas.toDataURL("image/jpeg");      
								var c = (counter - 1);
								var im_el = $('li#preview-list-' + c).find('img');
								var input_name = im_el.attr('rel');
								
								im_el.wrap($('<a class="preview-image-link" href="' + dataURL + '" target="_blank"></a>'));
								$.post(o.save_url, { current_url: window.location.href, 'data_url' : dataURL, filename: file.name,'field' : input_name, 'is_multiple': is_multiple }, function(resp)
								{
									progress.css({width: '100%'});
									progress.html('100%');
									prog_box.fadeOut('slow', function()
									{
										$(this).remove();
									});			
									files_uploaded += resp + ',';
									o.afterSave(files_uploaded, file_input, is_multiple);									
								});

							}

						}
						reader.readAsDataURL(file);

						$(img).addClass('photo-img');
						$(caption).addClass('photo-caption');
						$(credit).addClass('photo-credit');

						$('#photo-list').append(img).append(caption).append(credit);

						counter++;

					};
					

					function abortRead() 
					{
						reader.abort();
					}

					function errorHandler(evt) 
					{
						switch(evt.target.error.code) 
						{
							case evt.target.error.NOT_FOUND_ERR:
							alert('File Not Found!');
							break;
							case evt.target.error.NOT_READABLE_ERR:
							alert('File is not readable');
							break;
							case evt.target.error.ABORT_ERR:
							break; // noop
							default:
							alert('An error occurred reading this file.');
						};
					}

					
					
					
					var make_file_previews = function(files, file_input)
					{
						var stop_at = files.length;
						if ( ! is_multiple) 
						{
							stop_at = 1;
							preview.find('.upload_li').remove();
						};
						var $li = $('<li class="upload_li"></li>');
						var $img = $('<img src="" class="upload-pic" title="" rel="' + file_input.attr('name') + '" alt="" />');
						
						 
						for (var i = 0; i < stop_at; i++) 
						{
							(function (i) 
							{
								// Loop through our files with a closure so each of our FileReader's are isolated.
								var reader = new FileReader();
								
								var progress_box = $('<div class="fu_progress_bar"><div class="percent">0%</div></div>');
								progress_box.insertAfter(file_input);	
								var progress = progress_box.find('div.percent');
							 
								handle_file(files[i], i, progress);
							
								reader.onerror = errorHandler;
								reader.onprogress = function(evt) 
								{

									// evt is an ProgressEvent.
									if (evt.lengthComputable) 
									{
										var percentLoaded = Math.round((evt.loaded / evt.total) * 65);
										// Increase the progress bar length.
										if (percentLoaded < 100) 
										{
											progress.css({width: percentLoaded + '%'});
											progress.html(percentLoaded + '%');
										}
									}

								};
								
								reader.onabort = function(e) 
								{
									alert('File read cancelled');
								};
								reader.onloadstart = function(e) 
								{
									progress_box.addClass('loading');
								};

								
								
								reader.onload = function (event) 
								{
									var new_li = $li.clone().attr({
										id: file_input.attr('name') + '-preview-list-' + i,
									});
									var newImg = $img.clone().attr({
										id: file_input.attr('name') + '-' + i,
										src: event.target.result,
										title: (files[i].name),
										alt: (files[i].name)
									});
				
									progress.css('background-color', '#AFE3BD');
									
									// Resize large images...
									if (newImg.size() > 200) {
										newImg.width(200);
									}
									newImg.appendTo(new_li);
									preview.append(new_li);
								};
								reader.readAsDataURL(files[i]);
							})(i);
						};		
					};
				
					var file_input = $(this);
					is_multiple = file_input.hasClass('multiple');
					preview = $('<ul class="surround preview-file-box" id="pfb-' + file_input.attr('name') + '"></ul>');
					preview.insertAfter(file_input);

					// Input images
					file_input.bind('change', function(e)
					{
						e = e || window.event;
						e.preventDefault();

						// jQuery wraps the originalEvent, so we try to detect that here...
						e = e.originalEvent || e;
						// Using e.files with fallback because e.dataTransfer is immutable and can't be overridden in Polyfills (http://sandbox.knarly.com/js/dropfiles/).            
						var files = (e.files || e.target.files);

						make_file_previews(files, file_input);


					});

					// Manage drop events for dropping files
					if (o.use_drop) 
					{
						var str = (is_multiple) ? 'Drop files here.' : 'Drop file here. (only the first file dropped will be uploaded).';
						drop = $('<div class="surround droppable-file-box"><p>' + str +  '</p></div>');
						drop.insertAfter(preview);


						drop.bind({
							dragover: function () {
								$(this).addClass('hover');
								return false;
							},
							dragend: function () {
								$(this).removeClass('hover');
								return false;
							},
							drop: function (e) {
								e = e || window.event;
								e.preventDefault();

								// jQuery wraps the originalEvent, so we try to detect that here...
								e = e.originalEvent || e;
								// Using e.files with fallback because e.dataTransfer is immutable and can't be overridden in Polyfills (http://sandbox.knarly.com/js/dropfiles/).            
								var files = (e.files || e.dataTransfer.files);

								make_file_previews(files, file_input);

								return false;
							}
						});

					};
				});

		}
	});
	
})(jQuery);