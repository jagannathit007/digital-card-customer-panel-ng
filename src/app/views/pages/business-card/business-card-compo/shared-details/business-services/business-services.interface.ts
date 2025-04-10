export interface Payload{
    search: string,
    page:   number,
    limit:  number
}


export interface Services {
    docs?:          Doc[];
    totalDocs?:     number;
    limit?:         number;
    totalPages?:    number;
    page?:          number;
    pagingCounter?: number;
    hasPrevPage?:   boolean;
    hasNextPage?:   boolean;
    prevPage?:      null;
    nextPage?:      number;
  }

export interface Doc{
    _id:            string
    name:           string,
    image:          string,
    description:   string
}