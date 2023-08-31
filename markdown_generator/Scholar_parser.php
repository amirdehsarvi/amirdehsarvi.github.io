// Create a new instance of the parser class
require_once("scholar_profile_parser.class.php");
$parser = new ScholarProfileParser();

// The profile to parse (Amir Dehsarvi)
$profile_id = "RWGt9XQAAAAJ&hl";

// Read the html from Scholar into a DOM object
$parser->read_html_from_scholar_profile($scholar_id);
// Parse publication data from the DOM
$parser->parse_publications();
// Parse stats from the DOM (H-Index, citation count, i10 index)
$parser->parse_stats(); 

// Print the output
$parser->print_parsed_data_raw();   //Basic output as stored in JSON
echo $parser->format_publications_in_APA();  //Formatted as HTML table