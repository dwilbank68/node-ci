import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchBlog } from '../../actions';

class BlogShow extends Component {
    componentDidMount() {
        this.props.fetchBlog(this.props.match.params._id);
    }

    render() {
        if (!this.props.blog) {
            return '';
        }

        const { title, content } = this.props.blog;

        return (
            <div>
                <h3>{title}</h3>
                <p>{content}</p>
                {this.renderImage()}
            </div>
        );
    }

    renderImage() {
        const { imageUrl } = this.props.blog;

        if (imageUrl) {
            const url = 'https://s3-us-west-1.amazonaws.com/grider-advanced-node/';
            return <img src={url + imageUrl}/>                                // 1
        }
    }

}

function mapStateToProps({ blogs }, ownProps) {
    return { blog: blogs[ownProps.match.params._id] };
}

export default connect(mapStateToProps, { fetchBlog })(BlogShow);

// 1 -  get the url to the bucket by going to aws and clicking on one of the
//      files - grab the first part of the address
// https://s3-us-west-1.amazonaws.com/grider-advanced-node/