/** @jsx React.DOM */

define(
  [
    'react',
    'backbone',
    './ChosenDropdown.react'
  ],
  function (React, Backbone, ChosenDropdown) {

    return React.createClass({
      display: "EditTags",

      propTypes: {
        tags: React.PropTypes.instanceOf(Backbone.Collection).isRequired,
        activeTags: React.PropTypes.instanceOf(Backbone.Collection).isRequired,
        onTagsChanged: React.PropTypes.func.isRequired,
        onEnterKeyPressed: React.PropTypes.func.isRequired
      },

      onTagsChanged: function(arrayOfTagNames){
        this.props.onTagsChanged(arrayOfTagNames);
      },

      render: function () {
        return (
          <div className="tagger">
            <ChosenDropdown tags={this.props.tags}
                            activeTags={this.props.activeTags}
                            onTagsChanged={this.props.onTagsChanged}
                            onEnterKeyPressed={this.props.onEnterKeyPressed}
            />
          </div>
        );
      }

    });

  });
