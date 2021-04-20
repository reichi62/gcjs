<?php
/**
 * Class GPXFile
 */
class GPXFile { 

	private $fileName;
	private $fileSize;
	private $tmpName;
	private $uniqueName;

	function __construct($fileInfo) {
		$this->fileName = $fileInfo["userfile"]["name"];
		$this->fileSize = $fileInfo["userfile"]["size"];
		$this->tmpName =  $fileInfo["userfile"]["tmp_name"];
		$this->uniqueName = "../upload/gpx" . uniqid() . ".gpx";
	}

	public function getFileName() {return $this->fileName;}
	public function getUniqueName() {return $this->uniqueName;}

	public function upload() {
		$uploadOk = 1;
		// Check file size
		if ($this->fileSize > 2000000) {
			echo "Sorry, your file is too large.";
			$uploadOk = 0;
		}
		// Check extension
		if (!(strtolower(substr($this->fileName,-3)) === "gpx")) {
			echo "Sorry, this seems to be not a GPX file.";
			$uploadOk = 0;
		}
		// Check on error
		if ($uploadOk)
			if (!move_uploaded_file($this->tmpName, $this->uniqueName)) {
				echo "Upload error!<br>";
				$uploadOk = 0;
			}
		return $uploadOk;
	}

	public function writeContent($xmlObject) {
		$ts = new DateTime();
		$fn = "gpx" . $ts->format('YmdHis') . ".gpx";
		$fpn = "upload/" . $fn;
		$xml = new XmlDomModel();
		$xml->getXMLObject()->save($fpn);
		$_SESSION['downloadFileName'] = $fn;
	}
}
?>
