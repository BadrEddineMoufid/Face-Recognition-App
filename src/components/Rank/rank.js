import React from 'react';

//displaying user's name and rank aka num of entries
const Rank = ({name, entries}) => {
    return(
        <div>
            <div className='white f3'>
                {`${name} your current entry is...`}
            </div>
            <div className='f1'>
                {entries}
            </div>
        </div>
    );
}



export default Rank;