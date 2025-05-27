import * as React from "react";
import styles from "../Styles/Search.module.scss";
import { SearchBarProps } from "../IDistributerProps";

export default class SearchBar extends React.Component<SearchBarProps, any> {
  render() {
    return (
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="جستجو"
          value={this.props.value}
          onChange={this.props.onChange}
          className={styles.searchInput}
        />
        <svg className={styles.searchSvg} width="40" height="40" fill="black" viewBox="0 0 16 16">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
        </svg>
      </div>
    );
  }
}
