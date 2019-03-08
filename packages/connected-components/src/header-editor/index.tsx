/**
 * @nteract HeaderEditor component. For demo and documentation, see:
 * https://components.nteract.io/#headereditor.
 *
 * Note: The HeaderEditor is a @nteract connected component due to the
 * fact that it contains a publish to `Bookstore` function that is active
 * when `Bookstore` is enabled in the @nteract app.
 *
 * https://github.com/jupyter/nbformat/blob/master/nbformat/v4/nbformat.v4.schema.json#L67
 */

// Vendor imports
import {
  Button,
  EditableText,
  H1,
  ITagProps,
  Position,
  Tag,
  Tooltip
} from "@blueprintjs/core";
import { actions, AppState, ContentRef } from "@nteract/core";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

// Styled Components
const tagStyle: object = {
  background: "#f1f8ff",
  color: "#0366d6",
  marginRight: "5px"
};
const authorStyle: object = {
  background: "#E5E5E5",
  fontStyle: "italic",
  marginRight: "5px"
};
const authorStyleBlack: object = { ...authorStyle, color: "black" };

// Type Definitions
export interface AuthorObject {
  name: string;
}

export interface HeaderDataProps {
  authors: AuthorObject[];
  description: string;
  tags: string[];
  title: string;
}

export interface HeaderEditorBaseProps {
  /**
   * Whether or not the fields of the header can be edited.
   */
  editable: boolean;
  /**
   * Notebook content reference.
   */
  contentRef: ContentRef;
  /**
   * The data that the header should be populated with.
   */
  headerData: HeaderDataProps;
  /**
   * An event handler to run whenever header fields are modified.
   */
  onChange: (props?: Partial<HeaderDataProps>) => void;
  /**
   *
   */
  onRemove: (e: React.MouseEvent<HTMLButtonElement>, props: ITagProps) => void;
  /**
   * The theme of the header.
   */
  theme: "light" | "dark";
}

interface HeaderEditorMapStateToProps {
  /**
   * Whether publishing to `Bookstore` is enabled.
   */
  bookstoreEnabled?: boolean;
  /**
   * Whether the Header Editor is open/visible.
   */
  open?: boolean | undefined;
}

interface HeaderEditorMapDispatchToProps {
  /**
   * An event handler to publish notebook content to BookStore.
   */
  onPublish: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}

export type HeaderEditorProps = HeaderEditorBaseProps &
  HeaderEditorMapStateToProps &
  HeaderEditorMapDispatchToProps;

export interface HeaderEditorState {
  editMode: "none" | "author" | "tag";
}

// Constants
const addTagMessage: JSX.Element = <span>Add a tag</span>;
const addAuthorMessage: JSX.Element = <span>Add an author</span>;

class HeaderEditor extends React.PureComponent<
  HeaderEditorProps,
  HeaderEditorState
> {
  static defaultProps: Partial<HeaderEditorProps> = {
    bookstoreEnabled: false,
    editable: true,
    headerData: {
      authors: [],
      description: "",
      tags: [],
      title: ""
    },
    open: false,
    theme: "light"
  };

  constructor(props: HeaderEditorProps) {
    super(props);

    this.state = {
      editMode: "none"
    };
  }

  render(): JSX.Element | null {
    // Otherwise assume they have their own editor component
    const {
      editable,
      bookstoreEnabled,
      headerData,
      onPublish,
      open
    } = this.props;
    const marginStyles: object = { marginTop: "10px" };
    const styles: object = { background: "#EEE", padding: "10px" };

    return open ? (
      <header>
        <div style={styles}>
          <H1>
            <EditableText
              value={headerData.title}
              placeholder="Edit title..."
              disabled={!editable}
              onChange={this.onTextChange}
            />
          </H1>
          <div style={marginStyles}>
            <EditableText
              maxLength={280}
              maxLines={12}
              minLines={3}
              multiline
              placeholder="Edit description..."
              selectAllOnFocus={false}
              value={headerData.description}
              disabled={!editable}
              onChange={this.onEditorChange}
            />
          </div>
          <div>
            {headerData.authors.length <= 0 ? null : "By "}
            {headerData.authors.map((t, i) => (
              <Tag
                key={i}
                large
                minimal
                style={authorStyle}
                onRemove={this.onAuthorsRemove(t)}
              >
                {t.name}
              </Tag>
            ))}
            {(this.state.editMode === "author" && (
              <Tag style={authorStyleBlack}>
                <EditableText
                  maxLength={40}
                  className="author-entry"
                  placeholder="Enter Author Name..."
                  selectAllOnFocus
                  onConfirm={this.onAuthorsConfirm}
                  onCancel={this.onCancel}
                />
              </Tag>
            )) || (
              <Tooltip
                content={addAuthorMessage}
                position={Position.RIGHT}
                usePortal={false}
                disabled={!editable}
              >
                <Button
                  icon="add"
                  className="author-button"
                  onClick={this.onClick}
                  minimal
                  disabled={!editable}
                />
              </Tooltip>
            )}
          </div>

          <div>
            {headerData.tags.map((t, i) => (
              <Tag key={i} style={tagStyle} onRemove={this.onTagsRemove(t)}>
                {t}
              </Tag>
            ))}
            {(this.state.editMode === "tag" && (
              <Tag style={tagStyle}>
                <EditableText
                  maxLength={20}
                  placeholder="Enter Tag Name..."
                  selectAllOnFocus
                  onConfirm={this.onTagsConfirm}
                  onCancel={this.onCancel}
                />
              </Tag>
            )) || (
              <Tooltip
                content={addTagMessage}
                position={Position.RIGHT}
                usePortal={false}
                disabled={!editable}
              >
                {
                  <Button
                    icon="add"
                    minimal
                    onClick={this.onAdd}
                    disabled={!editable}
                  />
                }
              </Tooltip>
            )}
          </div>
          {bookstoreEnabled ? (
            <Button type={"button"} text={"Publish"} onClick={onPublish} />
          ) : null}
        </div>
      </header>
    ) : null;
  }

  private onTextChange = (newText: string): void => {
    this.props.onChange({ ...this.props.headerData, title: newText });
  };

  private onEditorChange = (newText: string) => {
    this.props.onChange({ ...this.props.headerData, description: newText });
  };

  private onAuthorsRemove = (t: any) => (
    evt: React.MouseEvent<HTMLButtonElement>,
    props: ITagProps
  ) => {
    if (this.props.editable === true) {
      this.props.onChange({
        ...this.props.headerData,
        authors: Array.from(this.props.headerData.authors).filter(p => {
          return p.name !== t.name;
        })
      });
      return;
    }
    return;
  };

  private onTagsRemove = (t: any) => (
    e: React.MouseEvent<HTMLButtonElement>,
    props: ITagProps
  ) => {
    if (this.props.editable === true) {
      this.props.onChange({
        ...this.props.headerData,
        tags: this.props.headerData.tags.filter(p => p !== t)
      });
      return;
    }
    return;
  };

  private onTagsConfirm = (e: any) => {
    this.props.onChange({
      ...this.props.headerData,
      tags: [...this.props.headerData.tags, e]
    });
    this.setState({ editMode: "none" });
  };

  private onAuthorsConfirm = (e: any) => {
    this.props.onChange({
      ...this.props.headerData,
      authors: [...this.props.headerData.authors, { name: e }]
    });
    this.setState({ editMode: "none" });
  };

  private onCancel = () => this.setState({ editMode: "none" });

  private onClick = () => this.setState({ editMode: "author" });

  private onAdd = () => this.setState({ editMode: "tag" });
}

const mapStateToProps = (appState: AppState, ownProps: HeaderEditorProps) => {
  const { core, app } = appState;
  const record = core.entities.contents.byRef.get(ownProps.contentRef);
  const host = app.host;
  console.log(host.toJS());
  const isBookstoreEnabled: boolean = host.bookstoreEnabled || false;
  const isHeaderEditorOpen: boolean | undefined =
    record !== undefined ? record.get("showHeaderEditor") : false;

  return {
    open: isHeaderEditorOpen,
    bookstoreEnabled: isBookstoreEnabled
  };
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  ownProps: { contentRef: ContentRef }
) => {
  return {
    onPublish: () =>
      dispatch(actions.publishToBookstore({ contentRef: ownProps.contentRef }))
  };
};

// We export this for testing purposes.
// export { HeaderEditor };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderEditor);
