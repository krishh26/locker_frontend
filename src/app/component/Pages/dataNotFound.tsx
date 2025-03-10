import React from 'react'

const DataNotFound = (props) => {
    const { width = "20%" } = props;
    return (
        <img src="assets/images/svgImage/noDataFound.svg" alt="Data-not-found" width={width} />
    )
}

export default DataNotFound