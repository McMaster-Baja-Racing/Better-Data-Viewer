import React from 'react'

import { ListThumbnailFile } from 'react-keyed-file-browser';

class SimpleListThumbnailFile extends React.Component {
  render() {
    return (
      <ListThumbnailFile
        {...this.props}
        showName={false}
        showSize={false}
        showModified={false}
        isSelectable={false}
      />
    )
  }
}

export default SimpleListThumbnailFile