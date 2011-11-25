<?php
date_default_timezone_set('Europe/London');
class Upload
{
	public $res;
	function __construct()
	{
		if (isset($_GET['save_data_url_image'])) 
		{
			
			$this->res = $this->save_data_url_image();
			
			return;
		}
		$this->res = $this->save_normally();
		return;
		
	}
	
	/**
	 * Save a file in $_FILES (fallback)
	 *
	 * @return void
	 * @author  
	 */
	function save_normally()
	{
		
	}
	
	/**
	 * Get from an array
	 *
	 * @return void
	 * @author  
	 */
	function arr_get($arr, $item) 
	{
		return (isset($arr[$item])) ? ($arr[$item]) : FALSE;
	}
	
	/**
	 * Save data url images and files
	 *
	 * @return void
	 * @author Dan Chadwick
	 */
	public function save_data_url_image()
	{
		$current_url = isset($_POST['current_url']) ? ($_POST['current_url']) : FALSE;
		

		$field = $this->arr_get($_POST, 'field');
		$data_url = $this->arr_get($_POST, 'data_url');		
		$filename = $this->arr_get($_POST, 'filename');				
		
		
		$dir = getcwd().'/uploads/'.$field.'/';
		$dir = (stristr($dir, '\\') !== FALSE) ? (str_replace('/', '\\', $dir)) : $dir ;
		if( ! file_exists($dir))
		{
			mkdir($dir, 0777, TRUE);
		}

		$arr = explode('.', $filename);
		$file_ext = end($arr);
		
		$filename = $filename.'-'.sha1(microtime()).'.'.$file_ext;
		
		if( ! file_exists($dir))
		{
			mkdir($dir, 0777, TRUE);
		}
		
		// This is the bit that recreates our image
		$image = base64_decode( str_replace('data:image/jpeg;base64,', '', $data_url));
		
		$upload_path = $dir.$filename;
		$file_path = 'uploads/'.$field.'/'.$filename;
		
		// Save file
		try{
			$fp = fopen($upload_path, 'w');
			fwrite($fp, $image);
			fclose($fp);	
		} catch (Exception $e)
		{
			return $e->getMessage();
		}
		
		
		
		
		
		return str_replace('//', '/', $file_path);
	
	}
}

	$u = new Upload();	

echo $u->res;

//Get the data from the post array when the form is submitted (eg alongside saving other data in the form)
if(isset($_POST['file_added']) || isset($_POST['files_added_multiples']))
{
	if (isset($_POST['files_added_multiples'])) 
	{
	
		foreach ($_POST['files_added_multiples'] as $field => $files_str) 
		{
			
			$files_arr = explode(',', $files_str);
			$files_arr = array_unique($files_arr);

			foreach ($files_arr as $file_path) 
			{
				if (empty($file_path)) 
				{
					continue;
				}
				// SAVE EACH IMAGE TO FIELD IN DATABASE			
			}
		}
	
	}

	if (isset($_POST['file_added'])) 
	{
		
		foreach ($_POST['file_added'] as $field => $value) 
		{
			if (empty($value)) 
			{
				continue;
			}
			// SAVE IMAGE TO FIELD
		}

	}

}
?>