
var all_uploaded;
var tfa =function()
{
	all_uploaded = '';

	var curr = 'upload.php?save_data_url_image=true';
	$('input[type=file]').fileUploader({
		use_drop: true,
		save_url: get_url() + curr, 
		afterSave: function(uploaded, input, is_multiple)
		{	
		
			var inp_name = input.attr('name');
			input.val('');			
			var uploaded = uploaded.split(',');

			if (uploaded[1] == '') 
			{
				img_url = uploaded[0];			
			}
			else
			{
				for (var i=0; i < uploaded.length; i++) 
				{
					all_uploaded = all_uploaded + ',' + uploaded[i];
				}
			}

			var current_first_image = $('img#' + inp_name + '-0');
			if (current_first_image.size() > 0) 
			{
				var current_first_image_src = current_first_image.attr('src');
				
				if ( ! is_multiple) 
				{
					$('img#' + inp_name + '-0').attr('src', get_url() +  img_url);
				};

			};			

			if (is_multiple) 
			{
				if ($('#files_added_multiples-' + inp_name).size() > 0) 
				{	
					$('#files_added_multiples-' + inp_name).val(all_uploaded);
				}
				else
				{
					var id_inp = $('<input type="hidden" name="files_added_multiples[' + inp_name + ']" id="files_added_multiples-' + inp_name + '" value="' + all_uploaded + '"/>');		
					id_inp.prependTo(input.parents('form:eq(0)'));					
				};

			}
			else
			{
				console.log(img_url);
				if ($('#file_added-' + inp_name).size() > 0) 
				{
					$('#file_added-' + inp_name).val(img_url);
				}
				else
				{
					var file_inp = $('<input type="hidden" name="file_added[' + inp_name + ']" id="file_added-' + inp_name + '" value="' + img_url + '"/>')					
					file_inp.prependTo(input.parents('form:eq(0)'));
				};
			}
		}
	});
}
$(document).ready(tfa);