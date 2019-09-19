import React from "react";

export default class OtherPage extends React.Component{
    constructor(props) {
        super(props);
        this.handleGoToPrevPage = this.handleGoToPrevPage.bind(this);
    }

    handleGoToPrevPage(e){
        e.preventDefault();
        global.docViewerComponent.setState({title: this.props.prevtitle});
    }

    render(){
        let url = "http://virt10.itu.chalmers.se/index.php/" + this.props.title.replace(' ', '_');
        return(
            <div className="insertediframe">
                <iframe src={url}></iframe>
                <a id="iframebacktext" onClick={this.handleGoToPrevPage} href="javascript:void(0)">While browsing in an iframe, the pattern graph <b>will not</b> update. Click here to return to the last none iframe article you visited...</a>
            </div>
        );
    }
}